import jwt from "jsonwebtoken";
import { FastifyRequest, FastifyReply } from "fastify";

export const verifyToken = (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return reply.status(401).send({ error: "No token provided" });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET ?? "");
    } catch (error) {
      return reply.status(401).send({ error: "Invalid token" });
    }

    return true;
  } catch (error) {
    return false;
  }
};
