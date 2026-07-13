const { z } = require('zod');

// basic sanity check — full YouTube URL, does not need to be unlisted-verified server-side
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

const createLectureSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    youtubeUrl: z.string().regex(YOUTUBE_URL_REGEX, 'Must be a valid YouTube URL'),
    batchId: z.string().min(1, 'batchId is required'),
  }),
});

module.exports = { createLectureSchema };