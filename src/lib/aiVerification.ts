/**
 * AI Face Verification Service
 * Integrates with face recognition APIs for photo verification
 * Supports multiple providers: AWS Rekognition, Google Vision, or custom API
 */

export interface VerificationResult {
  isValid: boolean;
  confidence: number;
  reason?: string;
  detailedResults?: {
    faceDetected: boolean;
    faceQuality: number;
    obscured: boolean;
    expressions?: string[];
    landmarks?: string[];
  };
}

export interface VerificationProvider {
  name: string;
  apiEndpoint: string;
  apiKey?: string;
}

class AIVerificationService {
  private provider: VerificationProvider;
  private readonly minConfidenceScore = 0.75;

  constructor(provider?: VerificationProvider) {
    this.provider = provider || {
      name: "custom",
      apiEndpoint: import.meta.env.VITE_AI_VERIFICATION_ENDPOINT || "/api/verify-face",
    };
  }

  /**
   * Verify a photo for face detection and quality
   */
  public async verifyPhoto(imageData: string | File): Promise<VerificationResult> {
    try {
      let base64Data: string;

      // Convert File to base64 if needed
      if (imageData instanceof File) {
        base64Data = await this.fileToBase64(imageData);
      } else {
        base64Data = imageData;
      }

      // Call verification API
      return await this.callVerificationAPI(base64Data);
    } catch (error) {
      console.error("[AIVerification] Error verifying photo:", error);
      return {
        isValid: false,
        confidence: 0,
        reason: "Verification service error",
      };
    }
  }

  /**
   * Verify face pair (ensure both photos are of same person)
   */
  public async verifyFacePair(
    faceImage: string | File,
    bodyImage: string | File
  ): Promise<VerificationResult> {
    try {
      let faceBase64: string;
      let bodyBase64: string;

      // Convert to base64
      if (faceImage instanceof File) {
        faceBase64 = await this.fileToBase64(faceImage);
      } else {
        faceBase64 = faceImage;
      }

      if (bodyImage instanceof File) {
        bodyBase64 = await this.fileToBase64(bodyImage);
      } else {
        bodyBase64 = bodyImage;
      }

      // Call pair verification API
      return await this.callPairVerificationAPI(faceBase64, bodyBase64);
    } catch (error) {
      console.error("[AIVerification] Error verifying face pair:", error);
      return {
        isValid: false,
        confidence: 0,
        reason: "Face pair verification failed",
      };
    }
  }

  /**
   * Check for inappropriate content
   */
  public async checkContentSafety(imageData: string | File): Promise<{
    isSafe: boolean;
    confidence: number;
    categories?: string[];
  }> {
    try {
      let base64Data: string;

      if (imageData instanceof File) {
        base64Data = await this.fileToBase64(imageData);
      } else {
        base64Data = imageData;
      }

      const response = await fetch(this.provider.apiEndpoint + "/safety", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.provider.apiKey && {
            Authorization: `Bearer ${this.provider.apiKey}`,
          }),
        },
        body: JSON.stringify({
          image: base64Data,
          imageType: "photo",
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[AIVerification] Error checking content safety:", error);
      return {
        isSafe: false,
        confidence: 0,
        categories: ["verification_error"],
      };
    }
  }

  /**
   * Detect fake/manipulated images
   */
  public async detectFakeImage(imageData: string | File): Promise<{
    isFake: boolean;
    confidence: number;
    indicators?: string[];
  }> {
    try {
      let base64Data: string;

      if (imageData instanceof File) {
        base64Data = await this.fileToBase64(imageData);
      } else {
        base64Data = imageData;
      }

      const response = await fetch(this.provider.apiEndpoint + "/detect-fake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.provider.apiKey && {
            Authorization: `Bearer ${this.provider.apiKey}`,
          }),
        },
        body: JSON.stringify({
          image: base64Data,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[AIVerification] Error detecting fake image:", error);
      return {
        isFake: false,
        confidence: 0,
        indicators: [],
      };
    }
  }

  /**
   * Call verification API
   */
  private async callVerificationAPI(base64Data: string): Promise<VerificationResult> {
    const response = await fetch(this.provider.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.provider.apiKey && {
          Authorization: `Bearer ${this.provider.apiKey}`,
        }),
      },
      body: JSON.stringify({
        image: base64Data,
        imageType: "photo",
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      isValid:
        result.confidence >= this.minConfidenceScore &&
        result.detailedResults?.faceDetected &&
        !result.detailedResults?.obscured,
      confidence: result.confidence,
      reason: this.getVerificationReason(result),
      detailedResults: result.detailedResults,
    };
  }

  /**
   * Call pair verification API
   */
  private async callPairVerificationAPI(
    faceBase64: string,
    bodyBase64: string
  ): Promise<VerificationResult> {
    const response = await fetch(this.provider.apiEndpoint + "/verify-pair", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.provider.apiKey && {
          Authorization: `Bearer ${this.provider.apiKey}`,
        }),
      },
      body: JSON.stringify({
        faceImage: faceBase64,
        bodyImage: bodyBase64,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      isValid: result.matchConfidence >= this.minConfidenceScore,
      confidence: result.matchConfidence,
      reason: result.matchConfidence < this.minConfidenceScore
        ? "Face in photos does not match"
        : "Verification successful",
    };
  }

  /**
   * Get human-readable verification reason
   */
  private getVerificationReason(result: any): string {
    if (result.confidence < this.minConfidenceScore) {
      return "Photo quality too low";
    }
    if (!result.detailedResults?.faceDetected) {
      return "No face detected in photo";
    }
    if (result.detailedResults?.obscured) {
      return "Face is obscured or partially hidden";
    }
    if (result.detailedResults?.faceQuality < 0.5) {
      return "Photo quality insufficient";
    }
    return "Verification successful";
  }

  /**
   * Convert File to base64
   */
  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // Remove data:image/... prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Set API provider
   */
  public setProvider(provider: VerificationProvider): void {
    this.provider = provider;
  }

  /**
   * Get current provider
   */
  public getProvider(): VerificationProvider {
    return this.provider;
  }
}

// Export singleton
export const aiVerificationService = new AIVerificationService();
