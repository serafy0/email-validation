import { NextFunction, Request, Response } from "express";
import * as dns from "dns";
import { promises as fs } from "fs"; // For reading temporary email domains list
import ApiError from "./errorHandling/ApiError";
import errorHandler from "./errorHandling/errorHandler";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const getDomain = (email: string) => {
  return email.split("@")[1];
};

async function validateRegex(email: string) {
  if (!EMAIL_REGEX.test(email)) {
    throw new ApiError(400, "Invalid email");
  }
}

async function checkMXRecord(email: string) {
  try {
    const domain = getDomain(email);
    const mxRecords = await dns.promises.resolveMx(domain);
    if (mxRecords.length === 0) {
      throw new ApiError(400, "MX record not resolved");
    }
    if (mxRecords[0].exchange === "0.0.0.0") {
      throw new ApiError(
        400,
        `email ${mxRecords[0].exchange} does not exist for MX`
      );
    }

    return mxRecords;
  } catch (err) {
    throw new ApiError(400, "MX record not resolved");
  }
}

async function checkTempDomains(email: string) {
  const domain = getDomain(email);

  const tempEmailDomains = await fs.readFile("temp_email_domains.txt", "utf-8"); // Replace with your list
  const tempEmailDomainsList = tempEmailDomains.split("\n");

  if (tempEmailDomainsList.includes(domain)) {
    throw new ApiError(400, "Temporary email address not allowed");
  }
}

export const validateEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  try {
    // 1. Validate email with regex
    await checkTempDomains(email);

    await validateRegex(email);
    const mxRecords = await checkMXRecord(email);

    return res.status(200).json({ message: "Email is valid", mxRecords });
  } catch (error: any) {
    console.error(error);
    error.status = 500;
    // errorHandler(error as ApiError, req, res, next);
    next(error);
  }
};
