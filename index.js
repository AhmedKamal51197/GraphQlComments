const {ApolloServer,gql} = require ('apollo-server');
// root types
//query
// scalar types Int , Float ,String ,Boolean,ID 
const axios= require('axios')
const users= [
{
     name:"Ahmed",
    email:"ahmed@ahmed.com",
    gender:"MALE",
    age:27,
    id:"abc123"
},
{
    name:"Ali",
        email:"ahmed@ahmed.com",
        gender:"MALE",
        age:27,
        id:"abc124"
},
{
    name:"mohamed",
        email:"ahmed@ahmed.com",
        gender:"MALE",
        age:27,
        id:"abc125"
    }
]
const typeDefs= gql`
   
type User{
    id:ID
    name:String
    email:String
    posts:[Post!]!
}

type Post{
    id:ID!
    title:String!
    body:String!
    comments:[Comment!]!
}
type Comment{
    id:ID!
    name:String!
    email:String!
    body:String!
}
enum Gender {
    MALE
    FEMALE
}
type user{
    name:String
}
input PaginationInput {
    page: Int!
    count: Int!
  }

type CreateCommentResponse {
    message:String!
    id:ID!
}  
input CommentInput {
    name:String!
    body:String!
    postId:String!
}
input PostIdInput {
    postId:String!
}
type Mutation {
    createComment (data:CommentInput,postId:PostIdInput) : CreateCommentResponse
}
type Query{
    me: String
    getProfile: User!
    users(pagination: PaginationInput!): [User!]!
    posts(pagination: PaginationInput!): [Post!]!
    getUserById(userId:String!):User!
    getPostById(postId:String!):Post!
    }
`

const server = new ApolloServer({
typeDefs,
resolvers:{
    Post:{
        comments:async(parent,args)=>{
            const commentResponse=await axios.get(`http://localhost:3000/posts/${parent.id}/comments`);
            return commentResponse.data
        }
    },
    User: {
        posts:async(parent,args)=>{

            const PostResponse=await axios.get(`http://localhost:3000/users/${parent.id}/posts`);
            return PostResponse.data;
        }
    },
    Query:{
        getPostById:async(_,args)=>{
            const postId=args.postId;
           const postResponse = await axios.get(`http://localhost:3000/posts/${postId}`);
           return postResponse.data;
        },
        posts:async (_,args)=>{
             const {pagination:{page , count}}=args;
            console.log(page,count);
            const postResponse = await axios.get(`http://localhost:3000/posts?_limit=${count}&_page=${page}`);
            return postResponse.data;
        },
        getUserById:async(_,args)=>{
            const userId=args.userId;
            const response=await axios.get(`http://localhost:3000/users/${userId}`);
            return response.data;
        },
        users:async (_,args)=>{
            const {pagination:{page ,count}} = args
            console.log(page,count)
            const response=await axios.get(`http://localhost:3000/users?_limit=${count}&_page=${page}`);
            return response.data
        },
        me:()=>"Hello world",
        getProfile:()=>({
        name:"Ahmed",
        email:"ahmed@ahmed.com",
   //     gender:"MALE",
 //       age:27,
        id:"abc123"
    }),
        // users:()=>users
    },
    Mutation:{
        createComment: async(parent,args)=>{
            console.log(args);
            const {postId,name,body}=args.data
            const response = await axios.post(`http://localhost:3000/posts/${postId}/comments`,{data:{name,body}});
            console.log(args.data)
            return {message:"comment create successfully", id:response.data.id}
        } 

    }
}
});


server.listen(4000).then(()=>{
    console.log('server started')
})