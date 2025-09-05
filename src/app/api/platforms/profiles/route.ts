import { NextRequest, NextResponse } from 'next/server';
import { getActiveProfiles, getAllProfiles, getProfilesByType, getOrCreateProfile } from '@/config/platform-profiles';
import { PlatformProfileManager } from '@/lib/platform-profile-manager';

// GET: 플랫폼 프로필 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const active = searchParams.get('active');
    const platformId = searchParams.get('id');

    // 특정 플랫폼 프로필 조회
    if (platformId) {
      const profile = getOrCreateProfile(platformId);
      if (!profile) {
        return NextResponse.json({
          success: false,
          error: `플랫폼 '${platformId}' 프로필을 찾을 수 없습니다`
        }, { status: 404 });
      }
      
      return NextResponse.json({
        success: true,
        profile
      });
    }

    // 조건별 프로필 목록 조회
    let profiles;
    if (type) {
      profiles = getProfilesByType(type);
    } else if (active === 'true') {
      profiles = getActiveProfiles();
    } else {
      profiles = getAllProfiles();
    }

    // 통계 정보 생성
    const stats = {
      total: profiles.length,
      byType: profiles.reduce((acc, profile) => {
        acc[profile.type] = (acc[profile.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byMethod: profiles.reduce((acc, profile) => {
        acc[profile.collectionMethod] = (acc[profile.collectionMethod] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byLanguage: profiles.reduce((acc, profile) => {
        const lang = profile.content?.language || 'unknown';
        acc[lang] = (acc[lang] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      avgQualityScore: profiles
        .filter(p => p.automated?.contentQualityScore)
        .reduce((sum, p) => sum + (p.automated!.contentQualityScore!), 0) / 
        profiles.filter(p => p.automated?.contentQualityScore).length || 0
    };

    return NextResponse.json({
      success: true,
      profiles,
      stats
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ 프로필 조회 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: '프로필 조회에 실패했습니다',
      details: errorMessage
    }, { status: 500 });
  }
}

// POST: 새 플랫폼 프로필 생성 또는 업데이트
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === 'auto-generate') {
      // 자동 프로필 생성
      const { baseUrl, name } = body;
      
      if (!baseUrl) {
        return NextResponse.json({
          success: false,
          error: 'baseUrl이 필요합니다'
        }, { status: 400 });
      }

      console.log(`🔍 자동 프로필 생성: ${baseUrl}`);
      
      const profile = await PlatformProfileManager.autoGenerateProfile(baseUrl, name);
      
      return NextResponse.json({
        success: true,
        message: '프로필이 자동 생성되었습니다',
        profile,
        action: 'generated'
      });

    } else if (body.action === 'analyze') {
      // 기존 플랫폼 분석 및 프로필 업데이트
      const { platformId } = body;
      
      if (!platformId) {
        return NextResponse.json({
          success: false,
          error: 'platformId가 필요합니다'
        }, { status: 400 });
      }

      const existingProfile = getOrCreateProfile(platformId);
      if (!existingProfile) {
        return NextResponse.json({
          success: false,
          error: `플랫폼 '${platformId}'를 찾을 수 없습니다`
        }, { status: 404 });
      }

      // 기존 프로필 기반으로 확장 프로필 재생성
      const updatedProfile = PlatformProfileManager.generateExtendedProfile(existingProfile);
      
      return NextResponse.json({
        success: true,
        message: '프로필이 분석 및 업데이트되었습니다',
        profile: updatedProfile,
        action: 'analyzed'
      });

    } else {
      return NextResponse.json({
        success: false,
        error: '지원되지 않는 액션입니다. auto-generate 또는 analyze를 사용하세요'
      }, { status: 400 });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ 프로필 생성/업데이트 실패:', error);
    
    return NextResponse.json({
      success: false,
      error: '프로필 생성/업데이트에 실패했습니다',
      details: errorMessage
    }, { status: 500 });
  }
}