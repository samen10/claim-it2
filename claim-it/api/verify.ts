
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userFid, castHash, targetFid } = req.query;
  const apiKey = process.env.NEYNAR_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key not configured' });
  }

  try {

    const castResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/cast?identifier=${castHash}&type=hash&viewer_fid=${userFid}`,
      {
        headers: {
          accept: 'application/json',
          api_key: apiKey,
        },
      }
    );
    const castData = await castResponse.json();
    const context = castData.cast.viewer_context; 

    const userResponse = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${targetFid}&viewer_fid=${userFid}`,
      {
        headers: {
          accept: 'application/json',
          api_key: apiKey,
        },
      }
    );
    const userData = await userResponse.json();
    const isFollowing = userData.users[0].viewer_context.following;

    return res.status(200).json({
      like: context.liked,
      recast: context.recasted,
      follow: isFollowing
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to verify actions' });
  }
}