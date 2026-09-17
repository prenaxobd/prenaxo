import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Email and password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || '').trim().toLowerCase();
        const password = String(credentials?.password || '');
        if (!email || !password) return null;

        const user = await prisma.user.findFirst({ where: { OR: [{ email }, { phone: email }] } });
        if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') return true;
      if (!user.email) return false;

      await prisma.user.upsert({
        where: { email: user.email.toLowerCase() },
        update: {
          name: user.name || profile?.name || user.email,
          image: user.image || profile?.picture || null,
        },
        create: {
          name: user.name || profile?.name || user.email,
          email: user.email.toLowerCase(),
          image: user.image || profile?.picture || null,
        },
      });

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const databaseUser = await prisma.user.findUnique({ where: { email: user.email.toLowerCase() } });
        if (databaseUser) token.userId = databaseUser.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) session.user.id = token.userId;
      return session;
    },
  },
  pages: { signIn: '/login' },
};
