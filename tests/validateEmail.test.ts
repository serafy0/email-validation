import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/server"; // Import your Express app

describe("Email validation endpoint tests", () => {
  test("Valid email should return success", async () => {
    const response = await request(app)
      .post("/check-email")
      .send({ email: "valid@example.com" });
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Email is valid");
  });

  test("no email should return error", async () => {
    const response = await request(app)
      .post("/check-email")
      .send({ email: "not-an-email.com" });
    expect(response.statusCode).toBe(400);
  });

  test("Fake email should return error", async () => {
    const response = await request(app)
      .post("/check-email")
      .send({
        email: `fake-person@non-existing-domain${Math.floor(Math.random() * 500)}.com`,
      });
    expect(response.statusCode).toBe(400);
  });

  test("Temporary email should return error", async () => {
    const response = await request(app)
      .post("/check-email")
      .send({ email: "temp@trackden.com" });
    expect(response.statusCode).toBe(400);
  });
});
