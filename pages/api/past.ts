// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { AbbeyImage } from "../../types/AbbeyImage";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const AWS = require("aws-sdk");

enum Error {
  None = "",
  NotFound = "No images have been processed",
  InvalidMethod = "Invalid REST API Call",
}

type Data = {
  error: Error;
  result?: AbbeyImage[];
};

// Retrieves recently processed images
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method == "GET") {
    const entries = await prisma.entry.findMany({
      where: { success: 1 },
      orderBy: { date: "desc" },
      take: 10,
    });

    let results: AbbeyImage[] = [];
    const myBucket = "abbey-road-livestream-data-owen";

    entries.forEach((e) => {
      const myKey = e.image.trim();
      const signedUrlExpireSeconds = 60 * 1;
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_ID,
        signatureVersion: "v4",
        region: "us-east-1",
        secretAccessKey: process.env.AWS_ACCESS_SECRET,
        sessionToken: process.env.AWS_SESSION
      });

      const url = s3.getSignedUrl("getObject", {
        Bucket: myBucket,
        Key: myKey,
        Expires: signedUrlExpireSeconds,
      });

      results.push({
        date: e.date,
        image: url,
        success: e.success == 1,
        confidence: e.confidence
      });
    });

    return res.status(200).json({
      error: Error.None,
      result: results,
    });
  } else {
    return res.status(400).json({ error: Error.InvalidMethod });
  }
}
