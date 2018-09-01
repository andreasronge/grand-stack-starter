import { neo4jgraphql } from "neo4j-graphql-js";

export const typeDefs = `
type User {
  id: ID!
  name: String
  friends(first: Int = 10, offset: Int = 0): [User] @relation(name: "FRIENDS", direction: "BOTH")
  reviews(first: Int = 10, offset: Int = 0): [Review] @relation(name: "WROTE", direction: "OUT")
  avgStars: Float @cypher(statement: "MATCH (this)-[:WROTE]->(r:Review) RETURN toFloat(avg(r.stars))")
  numReviews: Int @cypher(statement: "MATCH (this)-[:WROTE]->(r:Review) RETURN COUNT(r)")
}

type Business {
  id: ID!
  name: String
  address: String
  city: String
  state: String
  reviews(first: Int = 10, offset: Int = 0): [Review] @relation(name: "REVIEWS", direction: "IN")
  categories(first: Int = 10, offset: Int =0): [Category] @relation(name: "IN_CATEGORY", direction: "OUT")
}

type Review {
  id: ID!
  stars: Int
  text: String
  business: Business @relation(name: "REVIEWS", direction: "OUT")
  user: User @relation(name: "WROTE", direction: "IN")
}

type Category {
  name: ID!
  businesses(first: Int = 10, offset: Int = 0): [Business] @relation(name: "IN_CATEGORY", direction: "IN")
}

enum _UserOrdering {
  name_asc
  name_desc
  avgStars_asc
  avgStars_desc
  numReviews_asc
  numReviews_desc
}

type Person {
  id: ID!
  name: String
}

type Query {
    persons(id: ID, name: String, first: Int = 10, offset: Int = 0): [Person]
    users(id: ID, name: String, first: Int = 10, offset: Int = 0, orderBy: _UserOrdering): [User]
    businesses(id: ID, name: String, first: Int = 10, offset: Int = 0): [Business]
    reviews(id: ID, stars: Int, first: Int = 10, offset: Int = 0): [Review]
    category(name: ID!): Category
    usersBySubstring(substring: String, first: Int = 10, offset: Int = 0): [User] @cypher(statement: "MATCH (u:User) WHERE u.name CONTAINS $substring RETURN u")
}
type PersonOps {
  setScore(score: Int): Int
}

type Mutation {
  createPerson(name: String, id: ID): Person
  Person(id: ID): PersonOps
 
}
`;

// Person(id: 123) { setScore(score: 42) }

export const resolvers = {
  Query: {
    persons: neo4jgraphql,
    users: neo4jgraphql,
    businesses: neo4jgraphql,
    reviews: neo4jgraphql,
    category: neo4jgraphql,
    usersBySubstring: neo4jgraphql
  },
  Mutation: {
    Person: (p1, p2) => {
      console.log('p1', p1);
      console.log('p2', p2);
      return {
        setScore: (x1, x2) => {
          console.log('x1', x1);
          console.log('x2', x2);
          return 42;
        }
      }
    },
    createPerson: (obj, { name, id }, { driver } ) => {
      const session = driver.session();

      return session
        .run('MERGE (person:Person {name : {nameParam}, id: {idParam} }) RETURN person', {nameParam: name, idParam: id })
        .then( result => { return result.records.map(record => {
          console.log('created person', JSON.stringify(record.get("person").properties, null, 2));
          return record.get("person").properties
        })})
        // .then(function (result) {
        //     result.records.forEach(function (record) {
        //         console.log(record.get('name'));
        //     });
        //     session.close();
        // })
        .catch(function (error) {
            console.log(error);
            throw error;
        });
      //
      //   console.log('hoj' + message);
      // return 'hopp ' + message;
    }
  }
};
