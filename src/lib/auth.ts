import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { supabase } from "@/lib/supabase"

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'placeholder-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder-secret',
      authorization: {
        params: {
          prompt: "select_account",  // 항상 계정 선택 화면 표시
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7일 (초 단위)
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        // Supabase에 사용자 정보 저장 (환경변수가 있을 때만)
        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          try {
            const { error } = await supabase
              .from('user_profiles')
              .upsert({
                google_id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                provider: account.provider,
                last_sign_in: new Date().toISOString(),
              })
              .select()
            
            if (error) {
              console.error('Supabase 사용자 저장 에러:', error)
            }
          } catch (error) {
            console.error('사용자 정보 저장 실패:', error)
          }
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ user, token }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
}