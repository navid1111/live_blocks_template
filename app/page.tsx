'use client';
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useAuth,
} from '@clerk/nextjs';
import Link from 'next/link';
import { Footer } from './components/footer';
import './home.css';

export default function Home() {
  const { isSignedIn, userId } = useAuth();
  return (
    <>
      <main className="bg-[#FAFAFA] min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6 text-[#131316]">
            Welcome Back
          </h1>
          {isSignedIn ? (
            <h1>
              <SignOutButton>Sign Out </SignOutButton> {userId}
            </h1>
          ) : (
            <SignInButton>Sign in</SignInButton>
          )}
          <p className="text-[#5E5F6E] text-center mb-8">
            Sign in to access your account
          </p>

          <div className="flex justify-center">
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-lg bg-[#131316] text-white text-sm font-semibold w-full text-center"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="px-6 py-3 rounded-lg bg-[#131316] text-white text-sm font-semibold w-full">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
