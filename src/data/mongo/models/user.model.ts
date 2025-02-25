import { Collection, Db, ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  emailValidated: boolean;
  password: string;
  img?: string;
  role: string[];
}

export class UserRepository {
  private collection: Collection<User>;

  constructor(db: Db) {
    this.collection = db.collection<User>('users');
    
    this.collection.createIndex({ email: 1 }, { unique: true });
  }

  async findById(id: string): Promise<User | null> {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.collection.findOne({ email });
  }

  async create(userData: Omit<User, '_id'>): Promise<User> {
    const user: Omit<User, '_id'> = {
      ...userData,
      emailValidated: userData.emailValidated ?? false,
      role: userData.role ?? ['USER_ROLE']
    };
    
    if (!user.name) throw new Error('Name is required');
    if (!user.email) throw new Error('Email is required');
    if (!user.password) throw new Error('Password is required');
    
    const validRoles = ['ADMIN_ROLE', 'USER_ROLE'];
    if (user.role.some(role => !validRoles.includes(role))) {
      throw new Error('Invalid role');
    }

    const result = await this.collection.insertOne(user as User);
    return { ...user, _id: result.insertedId };
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: userData },
      { returnDocument: 'after' }
    );
    
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }
}