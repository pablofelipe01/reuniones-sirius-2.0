import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID!);

// Enhanced user type to include all necessary fields
interface AirtableUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

// Improved function to find user in Airtable with better error handling
async function findUserByEmail(email: string): Promise<AirtableUser | null> {
  try {
    const records = await base('Equipo').select({
      filterByFormula: `{email} = '${email}'`,
      maxRecords: 1
    }).firstPage();
    
    if (records.length > 0) {
      const record = records[0];
      return {
        id: record.id,
        name: record.fields.name as string,
        email: record.fields.email as string,
        role: record.fields.role as string,
      };
    }
    return null;
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "ejemplo@sirius.com"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        if (credentials?.email && credentials?.password) {
          // Find the user in Airtable
          const user = await findUserByEmail(credentials.email);
          
          if (user) {
            // Return the complete user object with proper data
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // Include additional user data in the session
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Pass additional user data to the token
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    }
  },
  session: {
    strategy: "jwt"
  },
};

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
});

export { authConfig };