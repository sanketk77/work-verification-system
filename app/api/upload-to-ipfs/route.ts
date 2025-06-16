import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "ethers";
import axios from "axios";

interface InternshipMetadata {
  certificateTitle: string;
  internName: string;
  internEmail: string;
  internWalletAddress: string;
  companyName: string;
  department: string;
  mentorName: string;
  duration: string;
  startDate: string;
  endDate: string;
  description: string;
  skills: string[];
  verificationUrl: string;
  issuedOn: string;
  supervisor: string;
}

export async function POST(req: NextRequest) {
  const metadata: InternshipMetadata = await req.json();

  const wallet = metadata?.internWalletAddress;
  if (!wallet || !isAddress(wallet)) {
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
    if (axios.isAxiosError(error)) {
      console.error(
        "Error uploading to IPFS:",
        error.response?.data ?? error.message
      );
    } else if (error instanceof Error) {
      console.error("Error uploading to IPFS:", error.message);
    } else {
      console.error("Unexpected error uploading to IPFS:", error);
    }

    return NextResponse.json(
      { error: "Failed to upload to IPFS" },
      { status: 500 }
    );
  }
}
