import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      service: 'frontend',
      version: '1.0.1',
      deployedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      gitCommit: process.env.GIT_COMMIT || 'local-development',
      buildNumber: process.env.BUILD_NUMBER || Date.now().toString(),
      nextVersion: process.env.npm_package_version || 'unknown',
      buildTime: process.env.BUILD_TIME || new Date().toISOString()
    },
    { status: 200 }
  );
}
