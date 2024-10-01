import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // You can add custom logic here if needed
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // You can check for specific roles here if needed
        return !!token
      },
    },
  }
)

export const config = { matcher: ["/protected/:path*"] }