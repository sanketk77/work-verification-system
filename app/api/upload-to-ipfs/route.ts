// // app/api/upload-to-ipfs/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { pinata } from '@/utils/config';
// import { ethers } from 'ethers';

// // Interface for address validation
// interface AddressValidation {
//   address: string;
//   type: 'supervisor' | 'intern';
//   isValid?: boolean;
//   error?: string;
// }

// // Function to validate addresses on Sepolia testnet
// async function validateAddressesOnSepolia(addresses: AddressValidation[]): Promise<AddressValidation[]> {
//   try {
//     // Initialize Sepolia provider - Compatible with ethers v5 and v6
//     const provider = new ethers.providers.JsonRpcProvider(
//       process.env.SEPOLIA_RPC_URL
//     );

//     const validationPromises = addresses.map(async (addressInfo) => {
//       try {
//         // Check if the address is a valid Ethereum address format
//         if (!ethers.utils.isAddress(addressInfo.address)) {
//           return {
//             ...addressInfo,
//             isValid: false,
//             error: 'Invalid Ethereum address format'
//           };
//         }

//         // Query the address to confirm it exists on the network
//         await provider.getBalance(addressInfo.address);

//         return {
//           ...addressInfo,
//           isValid: true
//         };

//       } catch (error: any) {
//         return {
//           ...addressInfo,
//           isValid: false,
//           error: `Address validation failed: ${error.message}`
//         };
//       }
//     });

//     return await Promise.all(validationPromises);

//   } catch (error: any) {
//     // If provider setup fails, return all as invalid
//     return addresses.map(addr => ({
//       ...addr,
//       isValid: false,
//       error: 'Unable to connect to Sepolia network for validation'
//     }));
//   }
// }

// // Interface for the internship certificate data
// interface InternshipCertificateData {
//   name: string;
//   description: string;
//   company: string;
//   supervisor: string;
//   intern: string;
//   duration: string;
//   skills: string[];
//   verificationUrl: string;
//   issuedOn: string;
// }

// // Interface for the API request body
// interface UploadRequest {
//   metadata: InternshipCertificateData;
//   filename?: string;
// }

// export async function POST(request: NextRequest) {
//   try {
//     // Parse the request body
//     const body: UploadRequest = await request.json();

//     // Validate required fields
//     if (!body.metadata) {
//       return NextResponse.json(
//         { error: 'Metadata is required' },
//         { status: 400 }
//       );
//     }

//     const { metadata, filename } = body;

//     // Validate required metadata fields
//     const requiredFields = ['name', 'description', 'company', 'supervisor', 'intern'];
//     const missingFields = requiredFields.filter(field => !metadata[field as keyof InternshipCertificateData]);

//     if (missingFields.length > 0) {
//       return NextResponse.json(
//         {
//           error: 'Missing required fields',
//           missingFields
//         },
//         { status: 400 }
//       );
//     }

//     // Validate Ethereum addresses format using ethers utility
//     if (!ethers.utils.isAddress(metadata.supervisor)) {
//       return NextResponse.json(
//         { error: 'Invalid supervisor address format' },
//         { status: 400 }
//       );
//     }

//     if (!ethers.utils.isAddress(metadata.intern)) {
//       return NextResponse.json(
//         { error: 'Invalid intern address format' },
//         { status: 400 }
//       );
//     }

//     // Validate addresses exist on Sepolia testnet
//     const addressValidationResults = await validateAddressesOnSepolia([
//       { address: metadata.supervisor, type: 'supervisor' },
//       { address: metadata.intern, type: 'intern' }
//     ]);

//     const invalidAddresses = addressValidationResults.filter(result => !result.isValid);
//     if (invalidAddresses.length > 0) {
//       return NextResponse.json(
//         {
//           error: 'Address validation failed',
//           invalidAddresses: invalidAddresses.map(addr => ({
//             address: addr.address,
//             type: addr.type,
//             reason: addr.error
//           }))
//         },
//         { status: 400 }
//       );
//     }

//     // Create a more descriptive filename if not provided
//     const defaultFilename = `internship-certificate-${metadata.intern.slice(0, 8)}-${Date.now()}.json`;
//     const finalFilename = filename || defaultFilename;

//     // Add additional metadata for better organization
//     const enhancedMetadata = {
//       ...metadata,
//       uploadedAt: new Date().toISOString(),
//       type: 'internship-certificate',
//       version: '1.0',
//       // Add IPFS-specific attributes
//       attributes: [
//         {
//           trait_type: 'Certificate Type',
//           value: 'Internship Completion'
//         },
//         {
//           trait_type: 'Company',
//           value: metadata.company
//         },
//         {
//           trait_type: 'Duration',
//           value: metadata.duration || 'Not specified'
//         },
//         {
//           trait_type: 'Skills Count',
//           value: metadata.skills.length
//         },
//         {
//           trait_type: 'Issued Date',
//           value: metadata.issuedOn
//         }
//       ]
//     };

//     // Upload to IPFS via Pinata
//     const uploadResult = await pinata.upload.json(enhancedMetadata, {
//       metadata: {
//         name: finalFilename,
//         keyvalues: {
//           type: 'internship-certificate',
//           company: metadata.company,
//           intern: metadata.intern,
//           supervisor: metadata.supervisor,
//         }
//       }
//     });

//     // Construct the IPFS URL
//     const ipfsUrl = `ipfs://${uploadResult.IpfsHash}`;
//     const gatewayUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${uploadResult.IpfsHash}`;

//     return NextResponse.json({
//       success: true,
//       data: {
//         ipfsHash: uploadResult.IpfsHash,
//         ipfsUrl: ipfsUrl,
//         gatewayUrl: gatewayUrl,
//         filename: finalFilename,
//         uploadedAt: enhancedMetadata.uploadedAt,
//         metadata: enhancedMetadata
//       }
//     });

//   } catch (error: any) {
//     console.error('IPFS upload error:', error);

//     // Handle specific Pinata errors
//     if (error.message?.includes('unauthorized')) {
//       return NextResponse.json(
//         { error: 'Unauthorized: Check your Pinata JWT token' },
//         { status: 401 }
//       );
//     }

//     if (error.message?.includes('quota')) {
//       return NextResponse.json(
//         { error: 'Storage quota exceeded' },
//         { status: 429 }
//       );
//     }

//     return NextResponse.json(
//       {
//         error: 'Failed to upload to IPFS',
//         details: error.message
//       },
//       { status: 500 }
//     );
//   }
// }
