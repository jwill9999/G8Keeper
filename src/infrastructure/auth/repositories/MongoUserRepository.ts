import mongoose, { Document, Schema, Model } from 'mongoose';
import { User } from '../../../domain/auth/User.js';
import type { UserRepository } from '../../../application/auth/ports/UserRepository.js';

interface UserDocument extends Document {
  email: string;
  password?: string;
  googleId?: string;
  name?: string;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: {
    type: String,
    required: function (this: UserDocument) {
      return !this.googleId;
    },
  },
  googleId: { type: String, sparse: true, unique: true },
  name: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel: Model<UserDocument> = mongoose.model<UserDocument>('User', userSchema);

function toDomain(doc: UserDocument): User {
  return new User(
    doc._id.toString(),
    doc.email,
    doc.password || '',
    doc.name,
    doc.googleId,
    doc.createdAt,
  );
}

export class MongoUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });
    return doc ? toDomain(doc) : null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const doc = await UserModel.findOne({ googleId });
    return doc ? toDomain(doc) : null;
  }

  async save(user: User): Promise<User> {
    const doc = await UserModel.create({
      email: user.email,
      password: user.getPasswordHash() || undefined,
      name: user.name,
      googleId: user.googleId,
    });
    return toDomain(doc);
  }

  async update(user: User): Promise<User> {
    const updateData: Record<string, unknown> = {
      email: user.email,
      name: user.name,
      googleId: user.googleId,
    };
    if (user.getPasswordHash()) {
      updateData.password = user.getPasswordHash();
    }
    const doc = await UserModel.findByIdAndUpdate(user.id, updateData, { new: true });
    if (!doc) throw new Error('User not found');
    return toDomain(doc);
  }
}
