import NextAuth, { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
     authorization:{
      params:{
        scope:'repo'
      }
     }
    }),
  ],
  secret: process.env.NEXT_SECRET,
  session: {
    strategy: 'jwt', // Use JWT strategy for session
  },
  callbacks: {
    async session({ session, token }) {
      // Add the access token to the session
      session.accessToken = token.accessToken;
      return session;
    },
    async jwt({ token, account }) {
      // If the account exists, set the access token
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
