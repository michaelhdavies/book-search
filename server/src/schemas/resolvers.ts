import { User/*, Book*/ } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';

// Interfaces go here 

interface AddUserArgs {
    username: string;
    email: string;
    password: string;
  }
  
  interface LoginUserArgs {
    email: string;
    password: string;
  }

  interface IBookInput {
    bookData: string;
  }

const resolvers = {
    Query: {
        me: async (_parent: any, _args: any, context: any) => {
            // If the user is authenticated, find and return the user's information excluding the pw

            if (context.user) {
              return User.findOne({ _id: context.user._id }).select('-__v -password');
            }
            // If the user is not authenticated, throw an AuthenticationError
            throw new AuthenticationError('Could not authenticate user.');
          },
    },
    Mutation: {
        login: async (_parent: any, { email, password }: LoginUserArgs) => {
            // Find a user with the provided email
            console.log('Login Data:', email, password);
            const user = await User.findOne({ email });
          
            // If no user is found, throw an AuthenticationError
            if (!user) {
              throw new AuthenticationError('Could not authenticate user (NO USER).');
            }
            console.log('User Data:', user);
            // Check if the provided password is correct
            const correctPw = await user.isCorrectPassword(password);
          
            // If the password is incorrect, throw an AuthenticationError
            if (!correctPw) {
              throw new AuthenticationError('Could not authenticate user (INCORRECT PW).');
            }
          
            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);
          
            // Return the token and the user
            return { token, user };
        },
        addUser: async (_parent: any, { username, email, password }: AddUserArgs) => {
            // Create a new user with the provided username, email, and password
            const user = await User.create({ username, email, password });
          
            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);
          
            // Return the token and the user
            return { token, user };
        },
        saveBook: async (_parent: any, { bookData }: IBookInput, context: any) => {
            if (context.user) {
                // const book = await Book.create({ bookId });
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData }},
                    { new: true }
                )
                // return book;
                return user;
            } throw new AuthenticationError('Error saving book');
        },
        removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any) => {
            if (context.user) {
                // const book = await Book.findOne({ bookId });
                const user = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId }}},
                    { new: true }
                );
                // return book;
                return user;
            } throw new AuthenticationError('Error deleting book');
        },
    },
};

export default resolvers;