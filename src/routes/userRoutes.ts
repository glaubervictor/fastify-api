import {
  createUser,
  createUserWithGoogleSso,
  getMe,
  loginUser,
} from "@/services/userServices";
import { FastifyTypedInstance } from "@/types";
import { verifyToken } from "@/utils";
import { z } from "zod";

export async function userRoutes(app: FastifyTypedInstance) {
  // Get a user logged in
  app.get(
    "/users/me",
    {
      preHandler: [verifyToken],
      schema: {
        tags: ["users"],
        description: "Get a user logged in from the token",
        response: {
          200: z
            .object({ id: z.string(), email: z.string() })
            .describe("Payload"),
          401: z.object({ error: z.string() }).describe("Unauthorized"),
        },
      },
    },
    async (request, reply) => {
      try {
        const user = await getMe(request);
        return reply.status(200).send(user);
      } catch (error) {
        return reply.status(400).send({ error: (error as Error).message });
      }
    }
  );

  // Create a user
  app.post(
    "/users",
    {
      schema: {
        tags: ["users"],
        description: "Create a new user",
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          201: z
            .object({
              id: z.string(),
              name: z.string(),
              email: z.string().email(),
            })
            .describe("User created"),
          400: z.object({ error: z.string() }).describe("Bad request"),
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, email, password } = request.body;

        const user = await createUser({ name, email, password });
        return reply.status(201).send(user);
      } catch (error) {
        return reply.status(400).send({ error: (error as Error).message });
      }
    }
  );

  // Create a user with Google SSO
  app.post(
    "/users/google",
    {
      schema: {
        tags: ["users"],
        description: "Create a new user with Google SSO",
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          googleId: z.string(),
        }),
        response: {
          201: z
            .object({
              id: z.string(),
              name: z.string(),
              email: z.string().email(),
            })
            .describe("User created"),
          400: z.object({ error: z.string() }).describe("Bad request"),
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, email, googleId } = request.body;

        const user = await createUserWithGoogleSso({ name, email, googleId });
        return reply.status(201).send(user);
      } catch (error) {
        return reply.status(400).send({ error: (error as Error).message });
      }
    }
  );

  // Login a user
  app.post(
    "/users/login",
    {
      schema: {
        tags: ["users"],
        description: "Login a user",
        body: z.object({
          email: z.string().email(),
          password: z.string(),
        }),
        response: {
          200: z
            .object({
              token: z.string(),
              user: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string().email(),
              }),
            })
            .describe("User logged in"),
          400: z.object({ error: z.string() }).describe("Bad request"),
        },
      },
    },
    async (request, reply) => {
      try {
        const { email, password } = request.body;

        const user = await loginUser(email, password);
        return reply.status(200).send(user);
      } catch (error) {
        return reply.status(400).send({ error: (error as Error).message });
      }
    }
  );
}
