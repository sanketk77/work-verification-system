import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "ethers";
import axios from "axios";

export async function POST(req: NextRequest) {
  const metadata = await req.json();
  const internAddress = metadata?.intern;

  if (!internAddress || !isAddress(internAddress)) {
    return NextResponse.json(
      { error: "Invalid or missing wallet address." },
      { status: 400 }
    );
  }

  try {
    const result = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      ipfsHash: result.data.IpfsHash,
      ipfsURI: `ipfs://${result.data.IpfsHash}`,
      gatewayURL: `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${result.data.IpfsHash}`,
    });
  } catch (error: unknown) {
    // First check if it's an AxiosError
    if (axios.isAxiosError(error)) {
      console.error(
        "Error uploading to IPFS:",
        error.response?.data ?? error.message
      );
    } else if (error instanceof Error) {
      // Some other Error
      console.error("Error uploading to IPFS:", error.message);
    } else {
      // Non-Error thrown
      console.error("Unexpected error uploading to IPFS:", error);
    }

    return NextResponse.json(
      { error: "Failed to upload to IPFS" },
      { status: 500 }
    );
  }
}
