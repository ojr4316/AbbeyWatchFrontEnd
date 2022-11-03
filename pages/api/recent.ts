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
  result?: AbbeyImage;
};

// Retrieves the most recent processed image
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method == "GET") {
    const entry = await prisma.entry.findFirst({ orderBy: { date: "desc" } });

    if (entry) {
      const myBucket = "abbey-road-livestream-data-owen";
      const myKey = entry.image.trim();
      const signedUrlExpireSeconds = 60 * 1;
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_ID,
        signatureVersion: "v4",
        region: "us-east-1",
        secretAccessKey: process.env.AWS_ACCESS_SECRET,
        sessionToken: process.env.AWS_SESSION_TOKEN
      });

      const url = s3.getSignedUrl("getObject", {
        Bucket: myBucket,
        Key: myKey,
        Expires: signedUrlExpireSeconds,
      });

      //console.log(url);

      return res.status(200).json({
        error: Error.None,
        result: {
          date: entry.date,
          image: url,
          success: entry.success == 1,
          confidence: entry.confidence
        },
      });
    } else {
      return res.status(404).json({ error: Error.NotFound });
    }
  } else {
    return res.status(400).json({ error: Error.InvalidMethod });
  }
}
