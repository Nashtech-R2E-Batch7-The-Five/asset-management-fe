import { gql } from "@apollo/client";

export const findUsers = gql`
  query FindUsers($page: Int, $query: String, $sortOrder: String, $type: String, $sort: String ) {
    findUsers(request: { page: $page, query: $query, sortOrder: $sortOrder, type: $type, sort: $sort }
    ) {
        page
        limit
        total
        totalPages
        users {
            id
            firstName
            staffCode
            lastName
            username
            gender
            joinedDate
            dateOfBirth
            type
            state
            location
        }
    }
}

`;