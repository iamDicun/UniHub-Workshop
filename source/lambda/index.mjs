import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import sharp from "sharp";

const s3 = new S3Client({
  region: "ap-southeast-1",
});

const BUCKET = "project-unihub-bucket";

const SIZES = {
  thumb: {
    w: 100,
    h: 100,
    fit: "cover",
  },

  medium: {
    w: 300,
    h: 300,
    fit: "inside",
  },

  large: {
    w: 800,
    h: 800,
    fit: "inside",
  },
};

export const handler = async (event) => {
  console.log(JSON.stringify(event));

  for (const record of event.Records) {
    try {
      const key = decodeURIComponent(
        record.s3.object.key.replace(/\+/g, " ")
      );

      console.log("Processing:", key);

      // tránh recursive trigger
      if (key.includes("/processed/")) {
        console.log("Skip processed file");
        continue;
      }

      // chỉ process original
      if (!key.includes("/original/")) {
        console.log("Skip non-original file");
        continue;
      }

      // validate extension
      const allowed = [".jpg", ".jpeg", ".png", ".webp"];

      const isValid = allowed.some((ext) =>
        key.toLowerCase().endsWith(ext)
      );

      if (!isValid) {
        console.log("Invalid extension");
        continue;
      }

      const match = key.match(
        /^users\/(.+?)\/original\/(.+)$/
      );

      if (!match) {
        console.log("Invalid path");
        continue;
      }

      const [, userId, filename] = match;

      const uuid = filename.replace(/\.[^.]+$/, "");

      // download original image
      const { Body } = await s3.send(
        new GetObjectCommand({
          Bucket: BUCKET,
          Key: key,
        })
      );

      const buffer = Buffer.from(
        await Body.transformToByteArray()
      );

      // resize multiple sizes
      for (const [size, opts] of Object.entries(SIZES)) {
        const resized = await sharp(buffer)
          .resize(opts.w, opts.h, {
            fit: opts.fit,
          })
          .webp({
            quality: 80,
          })
          .toBuffer();

        const outKey = `users/${userId}/processed/${size}/${uuid}.webp`;

        console.log("Uploading:", outKey);

        await s3.send(
          new PutObjectCommand({
            Bucket: BUCKET,
            Key: outKey,
            Body: resized,
            ContentType: "image/webp",
            CacheControl: "public, max-age=31536000",
          })
        );
      }

      console.log("Done:", key);
    } catch (err) {
      console.error(err);
    }
  }
};