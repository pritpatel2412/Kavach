import { NextResponse } from 'next/server';
import {
  testNeonPostgresConnection,
  testNeonAuthConnection,
  testNeonAiGatewayConfig,
  getNeonConfig,
} from '@kavach/api-contract';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getNeonConfig();
    let pgResult: any = null;
    let authResult: any = null;
    const aiGatewayResult = testNeonAiGatewayConfig();

    try {
      pgResult = await testNeonPostgresConnection();
    } catch (err: any) {
      pgResult = { success: false, error: err.message };
    }

    try {
      authResult = await testNeonAuthConnection();
    } catch (err: any) {
      authResult = { success: false, error: err.message };
    }

    return NextResponse.json({
      status: pgResult?.success && authResult?.success ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      branch: config.branch,
      services: {
        postgres: pgResult,
        auth: authResult,
        aiGateway: aiGatewayResult,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
