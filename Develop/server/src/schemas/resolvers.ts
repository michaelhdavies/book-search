import { User, Book } from '../models/index';
import { signToken, AuthenticationError } from '../services/auth.js';

// Interfaces go here 

interface AddUserArgs {
    input:{
      username: string;
      email: string;
      password: string;
    }
  }
  
  interface LoginUserArgs {
    email: string;
    password: string;
  }

  interface BookArgs {
    bookId: string;
  }

const resolvers = {
    Query: {
        me: async (_parent: any, _args: any, context: any) => {
            // If the user is authenticated, find and return the user's information along with their thoughts
            if (context.user) {
              return User.findOne({ _id: context.user._id }).populate('books');
            }
            // If the user is not authenticated, throw an AuthenticationError
            throw new AuthenticationError('Could not authenticate user.');
          },
    },
    Mutation: {
        login: async (_parent: any, { email, password }: LoginUserArgs) => {
            // Find a user with the provided email
            const user = await User.findOne({ email });
          
            // If no user is found, throw an AuthenticationError
            if (!user) {
              throw new AuthenticationError('Could not authenticate user.');
            }
          
            // Check if the provided password is correct
            const correctPw = await user.isCorrectPassword(password);
          
            // If the password is incorrect, throw an AuthenticationError
            if (!correctPw) {
              throw new AuthenticationError('Could not authenticate user.');
            }
          
            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);
          
            // Return the token and the user
            return { token, user };
        },
        addUser: async (_parent: any, { input }: AddUserArgs) => {
            // Create a new user with the provided username, email, and password
            const user = await User.create({ ...input });
          
            // Sign a token with the user's information
            const token = signToken(user.username, user.email, user._id);
          
            // Return the token and the user
            return { token, user };
        },
        saveBook: async (_parent: any, { bookId }: BookArgs, context: any) => {
            if (context.user) {
                const book = await Book.create({ bookId });
                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookId }},
                    { new: true }
                )
                return book;
            } throw AuthenticationError
        },
        removeBook: async (_parent: any, { bookId }: BookArgs, context: any) => {
            if (context.user) {
                const book = await Book.findOne({ bookId });
                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId }}}
                );
                return book;
            } throw AuthenticationError
        }
    }
};

export default resolvers;