"use client"
import React from 'react';
import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useCallback } from 'react';

const LandingPage = () => {

  const handleSignInClick = useCallback(() => {
    window.location.href = '/signin';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-4">Speech Language Therapy Management Software</h1>
            <p className="text-gray-600 mb-6">Streamline your speech language therapy practice with our comprehensive management system.</p>
            <Button
              onClick={handleSignInClick}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign In
            </Button>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoA7t0hXaMps7UiyZmyAKclXA5BEl0hcCGQg&s"
              alt="Speech Therapy Session"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;