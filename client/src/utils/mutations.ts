import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const ADD_USER = gql`
mutation addUser($email: String!, $password: String!, $username: String!) {
  addUser(email: $email, password: $password, username: $username) {
    token
    user {
      _id
      email
      username
    }
  }
}
`;

export const SAVE_BOOK = gql`
  mutation saveBook($bookData: BookInput!) {
    saveBook(bookData: $bookData) {
      _id
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;

export const REMOVE_BOOK = gql`
  mutation removeBook($bookData: BookInput!) {
    removeBook(bookData: $bookData) {
      _id
      savedBooks {
        bookId
        authors
        description
        tilte
        image
        link
      }
    }
  }
`;
