import Parser from 'rss-parser';
import { Article, Author, Platform, ArticleCategory } from '@/types/article';
import { CacheManager } from './cache-manager';
import { collectScrapedArticles } from './web-scraper';
import { calculateQualityScore, filterHighQualityArticles, suggestTags } from './content-quality-scorer';

const parser = new Parser();

// 플랫폼 메타데이터
const platforms = {
  toss: {
    id: 'toss',
    name: '토스 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://toss.tech',
    logoUrl: 'https://www.google.com/s2/favicons?domain=toss.tech&sz=64',
    description: '토스팀이 만드는 기술 이야기',
    isActive: true,
    rssUrl: 'https://toss.tech/rss.xml'
  },
  daangn: {
    id: 'daangn',
    name: '당근마켓 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://medium.com/daangn',
    logoUrl: 'https://www.google.com/s2/favicons?domain=team.daangn.com&sz=64',
    description: '당근마켓 팀의 기술 이야기',
    isActive: true,
    rssUrl: 'https://medium.com/feed/daangn'
  },
  kakao: {
    id: 'kakao',
    name: '카카오 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://tech.kakao.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=tech.kakao.com&sz=64',
    description: '카카오의 기술과 서비스 이야기',
    isActive: true,
    rssUrl: 'https://tech.kakao.com/feed/'
  },
  naver: {
    id: 'naver',
    name: '네이버 D2',
    type: 'corporate' as const,
    baseUrl: 'https://d2.naver.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=d2.naver.com&sz=64',
    description: '네이버 개발자들의 기술 이야기',
    isActive: true,
    rssUrl: 'https://d2.naver.com/d2.atom'
  },
  woowahan: {
    id: 'woowahan',
    name: '우아한형제들',
    type: 'corporate' as const,
    baseUrl: 'https://techblog.woowahan.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=techblog.woowahan.com&sz=64',
    description: '우아한형제들의 기술 블로그',
    isActive: true,
    rssUrl: 'https://techblog.woowahan.com/feed/'
  },
  medium: {
    id: 'medium',
    name: 'Medium',
    type: 'community' as const,
    baseUrl: 'https://medium.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=medium.com&sz=64',
    description: '전 세계 개발자들의 기술 이야기',
    isActive: true,
    rssUrl: 'https://medium.com/feed/tag/javascript'
  },
  google_dev: {
    id: 'google_dev',
    name: 'YouTube',
    type: 'corporate' as const,
    baseUrl: 'https://www.youtube.com/c/GoogleforDevelopers',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: 'Google for Developers',
    description: '구글 개발자 공식 채널',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC_x5XG1OV2P6uZZ5FSM9Ttw'
  },
  line_dev: {
    id: 'line_dev',
    name: 'YouTube',
    type: 'corporate' as const,
    baseUrl: 'https://www.youtube.com/c/LINEDevelopers',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: 'LINE Developers',
    description: 'LINE 개발자 채널',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBJZr0oJLpb6nnvT4wd6Q6g'
  },
  aws_korea: {
    id: 'aws_korea',
    name: 'YouTube',
    type: 'corporate' as const,
    baseUrl: 'https://www.youtube.com/c/AWSKorea',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: 'AWS Korea',
    description: 'AWS Korea 공식 채널',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCM9NbZtGTgXgpR2ksugR8nQ'
  },
  toast: {
    id: 'toast',
    name: 'YouTube',
    type: 'corporate' as const,
    baseUrl: 'https://www.youtube.com/c/tosstech',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: '토스트',
    description: '토스 개발 관련 영상',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC0Q4zA_2bNB4GCQAuwJCMHw'
  },
  line_blog: {
    id: 'line_blog',
    name: 'LINE 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://techblog.lycorp.co.jp/ko',
    logoUrl: 'https://www.google.com/s2/favicons?domain=techblog.lycorp.co.jp&sz=64',
    description: 'LINE의 기술 개발 이야기',
    isActive: true,
    rssUrl: 'https://techblog.lycorp.co.jp/ko/feed/index.xml'
  },
  coupang: {
    id: 'coupang',
    name: '쿠팡 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://medium.com/coupang-engineering',
    logoUrl: 'https://www.google.com/s2/favicons?domain=medium.com&sz=64',
    description: '쿠팡 엔지니어링팀의 기술 이야기',
    isActive: true,
    rssUrl: 'https://medium.com/feed/coupang-engineering'
  },
  banksalad: {
    id: 'banksalad',
    name: '뱅크샐러드',
    type: 'corporate' as const,
    baseUrl: 'https://blog.banksalad.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=blog.banksalad.com&sz=64',
    description: '뱅크샐러드 기술 블로그',
    isActive: true,
    rssUrl: 'https://blog.banksalad.com/rss.xml'
  },
  spoqa: {
    id: 'spoqa',
    name: '스포카',
    type: 'corporate' as const,
    baseUrl: 'https://spoqa.github.io',
    logoUrl: 'https://www.google.com/s2/favicons?domain=spoqa.github.io&sz=64',
    description: '스포카 기술 블로그',
    isActive: true,
    rssUrl: 'https://spoqa.github.io/rss'
  },
  kurly: {
    id: 'kurly',
    name: '마켓컬리 기술 블로그',
    type: 'corporate' as const,
    baseUrl: 'https://helloworld.kurly.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=helloworld.kurly.com&sz=64',
    description: '마켓컬리의 기술과 서비스 이야기',
    isActive: true,
    rssUrl: 'https://helloworld.kurly.com/feed.xml'
  },
  yogiyo: {
    id: 'yogiyo',
    name: '요기요 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://medium.com/yogiyo-tech',
    description: '요기요 기술팀의 개발 이야기',
    isActive: true,
    rssUrl: 'https://medium.com/feed/yogiyo-tech'
  },
  zigbang: {
    id: 'zigbang',
    name: '직방 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://medium.com/zigbang',
    logoUrl: 'https://www.google.com/s2/favicons?domain=medium.com&sz=64',
    description: '직방의 기술 개발 이야기',
    isActive: true,
    rssUrl: 'https://medium.com/feed/zigbang'
  },
  wanted: {
    id: 'wanted',
    name: '원티드랩 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://medium.com/wantedjobs',
    logoUrl: 'https://www.google.com/s2/favicons?domain=medium.com&sz=64',
    description: '원티드 개발팀의 기술 이야기',
    isActive: true,
    rssUrl: 'https://medium.com/feed/wantedjobs'
  },
  musinsa: {
    id: 'musinsa',
    name: '무신사 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://medium.com/musinsa-tech',
    logoUrl: 'https://www.google.com/s2/favicons?domain=medium.com&sz=64',
    description: '무신사의 기술과 개발 이야기',
    isActive: true,
    rssUrl: 'https://medium.com/feed/musinsa-tech'
  },
  goorm: {
    id: 'goorm',
    name: '구름 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://blog.goorm.io',
    logoUrl: 'https://www.google.com/s2/favicons?domain=blog.goorm.io&sz=64',
    description: '구름의 기술 개발 이야기',
    isActive: true,
    rssUrl: 'https://blog.goorm.io/feed/'
  },
  netmarble: {
    id: 'netmarble',
    name: '넷마블 기술블로그',
    type: 'corporate' as const,
    baseUrl: 'https://netmarble.engineering',
    logoUrl: 'https://www.google.com/s2/favicons?domain=netmarble.engineering&sz=64',
    description: '넷마블 개발팀의 기술 이야기',
    isActive: true,
    rssUrl: 'https://netmarble.engineering/rss/'
  },
  yozm: {
    id: 'yozm',
    name: '요즘IT',
    type: 'media' as const,
    baseUrl: 'https://yozm.wishket.com',
    description: 'IT 개발자와 기획자를 위한 전문 미디어',
    isActive: true,
    rssUrl: 'https://yozm.wishket.com/rss.xml'
  },
  velog: {
    id: 'velog',
    name: 'Velog',
    type: 'community' as const,
    baseUrl: 'https://velog.io',
    logoUrl: 'https://www.google.com/s2/favicons?domain=velog.io&sz=64',
    description: '개발자를 위한 블로그 서비스',
    isActive: false, // 개인 블로그들이 많아서 비활성화
    rssUrl: 'https://v2.velog.io/rss'
  },
  
  // 유튜브 채널들
  jocoding: {
    id: 'jocoding',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/c/조코딩JoCoding',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: '조코딩',
    description: '프로그래밍 교육 및 개발 관련 콘텐츠',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQNE2JmbasNYbjGAcuBiRRg'
  },
  codingapple: {
    id: 'codingapple',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/c/codingapple',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: '코딩애플',
    description: '웹개발 강의 및 프로그래밍 교육',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSLrpBAzr-ROVGHQ5EmxnUg'
  },
  yalco: {
    id: 'yalco',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/c/얄코',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: '얄팍한 코딩사전',
    description: '프로그래밍 기초를 쉽게 설명하는 교육 채널',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC2nkWbaJt1KQDi2r2XHRdJQ'
  },
  wony_coding: {
    id: 'wony_coding',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/c/워니코딩',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: '워니코딩',
    description: '웹 프론트엔드 개발 교육',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbqaTbqZlqKyPVFGTF15d7A'
  },
  winterlood: {
    id: 'winterlood',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/c/winterlood',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: '한입 크기로 잘라 먹는 리액트',
    description: 'React 전문 교육 채널',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCKk7MlO_-r_QXhp7dnBPF9Q'
  },
  opentutorials: {
    id: 'opentutorials',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/c/opentutorials',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: '생활코딩',
    description: '프로그래밍 교육의 대표 채널',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCvc8kv-i5fvFTJBFAk6n1SA'
  },
  
  // 뉴스/미디어 
  outstanding: {
    id: 'outstanding',
    name: '아웃스탠딩',
    type: 'media' as const,
    baseUrl: 'https://outstanding.kr',
    logoUrl: 'https://www.google.com/s2/favicons?domain=outstanding.kr&sz=64',
    description: '비즈니스와 테크 트렌드를 다루는 미디어',
    isActive: true,
    rssUrl: 'https://outstanding.kr/feed'
  },
  zdnet_korea: {
    id: 'zdnet_korea',
    name: 'ZDNet Korea',
    type: 'media' as const,
    baseUrl: 'https://zdnet.co.kr',
    description: 'IT 전문 뉴스 미디어',
    isActive: true,
    rssUrl: 'https://zdnet.co.kr/rss/news.xml'
  },
  
  // 기술 문서
  aws_docs: {
    id: 'aws_docs',
    name: 'AWS',
    type: 'docs' as const,
    baseUrl: 'https://aws.amazon.com/ko/blogs/korea/',
    logoUrl: 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=64',
    description: 'AWS 공식 한국 블로그',
    isActive: true,
    rssUrl: 'https://aws.amazon.com/ko/blogs/korea/feed/'
  },
  google_cloud_docs: {
    id: 'google_cloud_docs',
    name: 'Google Cloud',
    type: 'docs' as const,
    baseUrl: 'https://cloud.google.com/blog',
    logoUrl: 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=64',
    description: 'Google Cloud 공식 블로그',
    isActive: true,
    rssUrl: 'https://cloud.google.com/feeds/cloud-blog.xml'
  },
  microsoft_docs: {
    id: 'microsoft_docs',
    name: 'Microsoft',
    type: 'docs' as const,
    baseUrl: 'https://devblogs.microsoft.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=devblogs.microsoft.com&sz=64',
    description: 'Microsoft 개발자 블로그',
    isActive: true,
    rssUrl: 'https://devblogs.microsoft.com/feed/'
  },
  kubernetes_docs: {
    id: 'kubernetes_docs',
    name: 'Kubernetes',
    type: 'docs' as const,
    baseUrl: 'https://kubernetes.io/blog',
    logoUrl: 'https://www.google.com/s2/favicons?domain=kubernetes.io&sz=64',
    description: 'Kubernetes 공식 블로그',
    isActive: true,
    rssUrl: 'https://kubernetes.io/feed.xml'
  },
  python_docs: {
    id: 'python_docs',
    name: 'Python',
    type: 'docs' as const,
    baseUrl: 'https://blog.python.org',
    logoUrl: 'https://www.google.com/s2/favicons?domain=python.org&sz=64',
    description: 'Python 공식 블로그',
    isActive: true,
    rssUrl: 'https://blog.python.org/feeds/posts/default'
  },
  java_docs: {
    id: 'java_docs',
    name: 'Java',
    type: 'docs' as const,
    baseUrl: 'https://blogs.oracle.com/java',
    logoUrl: 'https://www.google.com/s2/favicons?domain=oracle.com&sz=64',
    description: 'Oracle Java 공식 블로그',
    isActive: true,
    rssUrl: 'https://blogs.oracle.com/java/rss'
  },
  nodejs_docs: {
    id: 'nodejs_docs',
    name: 'Node.js',
    type: 'docs' as const,
    baseUrl: 'https://nodejs.org/en/blog',
    logoUrl: 'https://www.google.com/s2/favicons?domain=nodejs.org&sz=64',
    description: 'Node.js 공식 블로그',
    isActive: true,
    rssUrl: 'https://nodejs.org/en/feed/blog.xml'
  },
  react_docs: {
    id: 'react_docs',
    name: 'React',
    type: 'docs' as const,
    baseUrl: 'https://react.dev/blog',
    logoUrl: 'https://www.google.com/s2/favicons?domain=react.dev&sz=64',
    description: 'React 공식 블로그',
    isActive: true,
    rssUrl: 'https://react.dev/rss.xml'
  },
  docker_docs: {
    id: 'docker_docs',
    name: 'Docker',
    type: 'docs' as const,
    baseUrl: 'https://www.docker.com/blog',
    logoUrl: 'https://www.google.com/s2/favicons?domain=docker.com&sz=64',
    description: 'Docker 공식 블로그',
    isActive: true,
    rssUrl: 'https://www.docker.com/blog/feed/'
  },
  github_docs: {
    id: 'github_docs',
    name: 'GitHub',
    type: 'docs' as const,
    baseUrl: 'https://github.blog',
    logoUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=64',
    description: 'GitHub 공식 블로그',
    isActive: true,
    rssUrl: 'https://github.blog/feed/'
  },
  mongodb_docs: {
    id: 'mongodb_docs',
    name: 'MongoDB',
    type: 'docs' as const,
    baseUrl: 'https://www.mongodb.com/blog',
    logoUrl: 'https://www.google.com/s2/favicons?domain=mongodb.com&sz=64',
    description: 'MongoDB 공식 블로그',
    isActive: true,
    rssUrl: 'https://www.mongodb.com/blog/rss.xml'
  },
  redis_docs: {
    id: 'redis_docs',
    name: 'Redis',
    type: 'docs' as const,
    baseUrl: 'https://redis.io/blog',
    logoUrl: 'https://www.google.com/s2/favicons?domain=redis.io&sz=64',
    description: 'Redis 공식 블로그',
    isActive: true,
    rssUrl: 'https://redis.io/blog/rss.xml'
  },
  digitalocean_docs: {
    id: 'digitalocean_docs',
    name: 'DigitalOcean',
    type: 'docs' as const,
    baseUrl: 'https://www.digitalocean.com/blog',
    logoUrl: 'https://www.google.com/s2/favicons?domain=digitalocean.com&sz=64',
    description: 'DigitalOcean 기술 블로그',
    isActive: true,
    rssUrl: 'https://www.digitalocean.com/blog/feed.xml'
  },
  
  // 한국 기업 기술 문서
  naver_developers: {
    id: 'naver_developers',
    name: 'NAVER Developers',
    type: 'docs' as const,
    baseUrl: 'https://developers.naver.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=developers.naver.com&sz=64',
    description: 'NAVER 개발자센터',
    isActive: true,
    rssUrl: 'https://developers.naver.com/rss/blog.xml'
  },
  kakao_developers: {
    id: 'kakao_developers',
    name: 'Kakao Developers',
    type: 'docs' as const,
    baseUrl: 'https://developers.kakao.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=developers.kakao.com&sz=64',
    description: 'Kakao 개발자센터',
    isActive: true,
    rssUrl: 'https://developers.kakao.com/blog/feed'
  },
  samsung_developers: {
    id: 'samsung_developers',
    name: 'Samsung Developers',
    type: 'docs' as const,
    baseUrl: 'https://developer.samsung.com/blog',
    logoUrl: 'https://www.google.com/s2/favicons?domain=developer.samsung.com&sz=64',
    description: 'Samsung 개발자 포털',
    isActive: true,
    rssUrl: 'https://developer.samsung.com/blog/ko/feed'
  },
  lg_developers: {
    id: 'lg_developers',
    name: 'LG Developers',
    type: 'docs' as const,
    baseUrl: 'https://developer.lge.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=developer.lge.com&sz=64',
    description: 'LG 개발자 포털',
    isActive: true,
    rssUrl: 'https://developer.lge.com/blog/feed'
  },
  nhn_developers: {
    id: 'nhn_developers',
    name: 'NHN Developers',
    type: 'docs' as const,
    baseUrl: 'https://meetup.nhncloud.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=nhncloud.com&sz=64',
    description: 'NHN Cloud 기술 미팅',
    isActive: true,
    rssUrl: 'https://meetup.nhncloud.com/rss'
  },
  kt_developers: {
    id: 'kt_developers',
    name: 'KT Developers',
    type: 'docs' as const,
    baseUrl: 'https://devlog.kt.co.kr',
    logoUrl: 'https://www.google.com/s2/favicons?domain=kt.co.kr&sz=64',
    description: 'KT 개발자 블로그',
    isActive: true,
    rssUrl: 'https://devlog.kt.co.kr/feed'
  },
  geekle_events: {
    id: 'geekle_events',
    name: 'Geekle',
    type: 'community' as const,
    baseUrl: 'https://geekle.us',
    logoUrl: 'https://www.google.com/s2/favicons?domain=geekle.us&sz=64',
    description: '글로벌 개발자 온라인 컨퍼런스',
    isActive: true,
    rssUrl: 'https://geekle.us/feed'
  },
  awskorea_events: {
    id: 'awskorea_events',
    name: 'AWS Korea',
    type: 'corporate' as const,
    baseUrl: 'https://aws.amazon.com/ko/events',
    logoUrl: 'https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=64',
    description: 'AWS Korea 이벤트',
    isActive: true,
    rssUrl: 'https://aws.amazon.com/ko/about-aws/events/rss/'
  },
  microsoft_events: {
    id: 'microsoft_events',
    name: 'Microsoft Korea',
    type: 'corporate' as const,
    baseUrl: 'https://www.microsoft.com/ko-kr/events',
    logoUrl: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=64',
    description: 'Microsoft Korea 이벤트',
    isActive: true,
    rssUrl: 'https://www.microsoft.com/ko-kr/events/feed'
  },
  google_events: {
    id: 'google_events',
    name: 'Google Developers',
    type: 'corporate' as const,
    baseUrl: 'https://developers.google.com/events',
    logoUrl: 'https://www.google.com/s2/favicons?domain=developers.google.com&sz=64',
    description: 'Google 개발자 이벤트',
    isActive: true,
    rssUrl: 'https://developers.google.com/events/feed'
  },
  figma_youtube: {
    id: 'figma_youtube',
    name: 'YouTube',
    type: 'corporate' as const,
    channelName: 'Figma',
    baseUrl: 'https://www.youtube.com/c/Figma',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    description: 'Figma 공식 라이브 행사',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQelDpbPgXodfWyJ1J7yGew'
  },
  google_io_youtube: {
    id: 'google_io_youtube',
    name: 'YouTube',
    type: 'corporate' as const,
    channelName: 'Google I/O',
    baseUrl: 'https://www.youtube.com/c/GoogleIO',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    description: 'Google I/O 컨퍼런스',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC_x5XG1OV2P6uZZ5FSM9Ttw'
  },
  microsoft_youtube: {
    id: 'microsoft_youtube',
    name: 'YouTube',
    type: 'corporate' as const,
    channelName: 'Microsoft Developer',
    baseUrl: 'https://www.youtube.com/c/MicrosoftDeveloper',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    description: 'Microsoft 개발자 이벤트',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCsMica-v34Irf9KVTh6xx-g'
  },
  adobe_youtube: {
    id: 'adobe_youtube',
    name: 'YouTube',
    type: 'corporate' as const,
    channelName: 'Adobe Creative Cloud',
    baseUrl: 'https://www.youtube.com/c/AdobeCreativeCloud',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    description: 'Adobe 크리에이티브 이벤트',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCL0iAkpqV5YaIVG7xkDtS4Q'
  },
  apple_dev_youtube: {
    id: 'apple_dev_youtube',
    name: 'YouTube',
    type: 'corporate' as const,
    channelName: 'Apple Developer',
    baseUrl: 'https://www.youtube.com/c/AppleDeveloper',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    description: 'Apple 개발자 이벤트',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC_x5XG1OV2P6uZZ5FSM9Ttw'
  },
  hashicorp_youtube: {
    id: 'hashicorp_youtube',
    name: 'YouTube',
    type: 'corporate' as const,
    channelName: 'HashiCorp',
    baseUrl: 'https://www.youtube.com/c/HashiCorp',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    description: 'HashiCorp 인프라 이벤트',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC-AdvAxaagE9W2f0webyNUQ'
  },
  philipp_schmid: {
    id: 'philipp_schmid',
    name: 'Philipp Schmid Blog',
    type: 'personal' as const,
    baseUrl: 'https://www.philschmid.de',
    logoUrl: 'https://www.google.com/s2/favicons?domain=philschmid.de&sz=64',
    description: 'Google DeepMind 시니어 AI 릴레이션 엔지니어 블로그',
    isActive: true,
    rssUrl: 'https://www.philschmid.de/rss'
  },
  hacker_news: {
    id: 'hacker_news',
    name: 'Hacker News',
    type: 'community' as const,
    baseUrl: 'https://news.ycombinator.com',
    logoUrl: 'https://www.google.com/s2/favicons?domain=news.ycombinator.com&sz=64',
    description: '지적 호기심을 자극하는 기술 뉴스',
    isActive: true,
    rssUrl: 'https://news.ycombinator.com/rss'
  },
  coding_apple: {
    id: 'coding_apple',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/@codingapple',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: '코딩 애플',
    description: '실무에 필요한 웹개발 강의',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSLrpBAzr-ROVGHQ5EmxnUg'
  },
  nomad_coders: {
    id: 'nomad_coders',
    name: 'YouTube',
    type: 'educational' as const,
    baseUrl: 'https://www.youtube.com/@nomadcoders',
    logoUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
    channelName: '노마드코더',
    description: '클론 코딩으로 배우는 실무 개발',
    isActive: true,
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCUpJs89fSBXNolQGOYKn0YQ'
  }
};

// HTML 태그 제거 및 텍스트 정제 함수
function stripHtmlAndClean(html: string): string {
  if (!html) return '';
  
  return html
    // 스크립트와 스타일 태그 완전 제거
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // HTML 태그 제거
    .replace(/<[^>]*>/g, '')
    // HTML 엔티티 디코드 (더 확장)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&hellip;/g, '...')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#\d+;/g, '') // 기타 숫자 엔티티 제거
    // 특수문자 정리
    .replace(/\u00a0/g, ' ') // non-breaking space
    .replace(/[\u200b-\u200d\ufeff]/g, '') // zero-width characters
    // 연속된 공백과 개행 정리
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, ' ')
    // 앞뒤 공백 제거
    .trim();
}

// excerpt 생성 함수
function generateExcerpt(content: string, maxLength: number = 200): string {
  const cleanText = stripHtmlAndClean(content);
  if (!cleanText) return '';
  if (cleanText.length <= maxLength) return cleanText;
  
  // 문장 경계에서 자르기 (한국어 및 영어 문장부호 고려)
  const truncated = cleanText.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?'),
    truncated.lastIndexOf('。'), // 한국어 문장 부호
    truncated.lastIndexOf('?'), // 한국어 물음표
    truncated.lastIndexOf('!') // 한국어 느낌표
  );
  
  if (lastSentenceEnd > maxLength * 0.6) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  // 쉼표나 구두점에서 자르기
  const lastPunctuation = Math.max(
    truncated.lastIndexOf(','),
    truncated.lastIndexOf(';'),
    truncated.lastIndexOf(':'),
    truncated.lastIndexOf('、'), // 한국어 쉼표
    truncated.lastIndexOf('：') // 한국어 콜론
  );
  
  if (lastPunctuation > maxLength * 0.7) {
    return truncated.substring(0, lastPunctuation) + '...';
  }
  
  // 단어/어절 경계에서 자르기
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

// YouTube 관련 함수들
function extractVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function estimateVideoDuration(): number {
  // YouTube 영상의 평균 길이를 고려한 추정값 (초 단위)
  // 실제로는 YouTube Data API를 사용해야 하지만 여기서는 추정
  return Math.floor(Math.random() * 1200) + 300; // 5분~25분 사이 랜덤
}

// 스마트 태그 생성 함수
function generateSmartTags(title: string, content: string, originalTags: string[], category: string): string[] {
  const text = `${title} ${content}`.toLowerCase();
  const smartTags: string[] = [];
  
  // 기본 원본 태그들 (일반적인 태그들 제외)
  const excludeGenericTags = ['tech', 'technology', 'development', 'programming', 'software', 'it'];
  const filteredOriginalTags = originalTags.filter(tag => 
    !excludeGenericTags.includes(tag.toLowerCase())
  );
  smartTags.push(...filteredOriginalTags);
  
  // 기술 키워드 기반 태그
  const techKeywords = {
    'React': ['react', 'jsx', 'hooks', 'component'],
    'Vue': ['vue', 'vuejs', 'nuxt'],
    'Angular': ['angular', 'typescript'],
    'JavaScript': ['javascript', 'js', 'node.js', 'nodejs'],
    'Python': ['python', 'django', 'flask', 'fastapi'],
    'Java': ['java', 'spring', 'kotlin'],
    'Go': ['golang', 'go'],
    'Docker': ['docker', 'container', 'containerization'],
    'Kubernetes': ['kubernetes', 'k8s', 'orchestration'],
    'AWS': ['aws', 'amazon web services', 'lambda', 's3'],
    'AI': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning'],
    'Database': ['database', 'sql', 'mysql', 'postgresql', 'mongodb'],
    'API': ['api', 'rest', 'graphql', 'endpoint'],
    'DevOps': ['devops', 'ci/cd', 'jenkins', 'deployment'],
    'Frontend': ['frontend', 'ui', 'ux', 'design system'],
    'Backend': ['backend', 'server', 'microservices'],
    'Mobile': ['mobile', 'app', 'ios', 'android', 'react native', 'flutter'],
    'Security': ['security', 'authentication', 'authorization', 'jwt', 'oauth'],
    'Performance': ['performance', 'optimization', 'speed', 'caching'],
    'Testing': ['test', 'testing', 'unit test', 'integration'],
    'Architecture': ['architecture', 'design pattern', 'scalability']
  };
  
  // 키워드 매칭으로 스마트 태그 생성
  Object.entries(techKeywords).forEach(([tag, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      smartTags.push(tag);
    }
  });
  
  // 카테고리 기반 태그 추가 (필수)
  const categoryTags = {
    'frontend': ['Frontend', 'UI/UX'],
    'backend': ['Backend', 'Server'],
    'ai-ml': ['AI', 'Machine Learning'],
    'cloud-infra': ['Cloud', 'Infrastructure'],
    'mobile': ['Mobile', 'App'],
    'data': ['Data', 'Analytics'],
    'security': ['Security', 'DevSecOps'],
    'game': ['Game Dev', 'Unity'],
    'design': ['Design', 'UX'],
    'office': ['Productivity', 'Tools']
  };
  
  if (categoryTags[category]) {
    smartTags.push(...categoryTags[category]);
  }
  
  // 태그가 부족하면 기본 태그들 추가
  if (smartTags.length < 2) {
    const fallbackTags = ['Development', 'Engineering', 'Tutorial', 'Guide', 'Tips'];
    smartTags.push(...fallbackTags.slice(0, 3 - smartTags.length));
  }
  
  // 중복 제거 및 최대 4개로 제한
  const uniqueTags = [...new Set(smartTags)];
  return uniqueTags.slice(0, 4);
}

// 카테고리 자동 분류 함수
function categorizeArticle(title: string, content: string, tags: string[]): string {
  const text = `${title} ${content} ${tags.join(' ')}`.toLowerCase();
  
  const categoryKeywords = {
    frontend: {
      keywords: ['react', 'vue', 'angular', 'javascript', 'typescript', 'css', 'html', 'frontend', 'ui', 'ux', 'design system', 'component', 'jsx', 'dom', 'browser', 'nextjs', 'svelte', 'webpack', 'vite', '프론트엔드', '리액트', '자바스크립트'],
      weight: 0
    },
    backend: {
      keywords: ['backend', 'server', 'api', 'database', 'sql', 'nosql', 'node.js', 'python', 'java', 'spring', 'express', 'fastapi', 'django', 'mysql', 'postgresql', 'mongodb', 'microservices', 'golang', 'rust', '백엔드', '서버', '데이터베이스'],
      weight: 0
    },
    'ai-ml': {
      keywords: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'ml', 'tensorflow', 'pytorch', 'chatgpt', 'gpt', 'llm', 'neural network', 'data science', 'openai', 'claude', 'gemini', 'langchain', '인공지능', '머신러닝', '딥러닝'],
      weight: 0
    },
    'cloud-infra': {
      keywords: ['cloud', 'aws', 'azure', 'gcp', 'kubernetes', 'k8s', 'docker', 'terraform', 'ansible', 'infrastructure', 'serverless', 'lambda', 'containers', 'microservices', 'monitoring', 'observability', 'prometheus', 'grafana', '클라우드', '인프라', '쿠버네티스'],
      weight: 0
    },
    game: {
      keywords: ['game', 'unity', 'unreal', 'godot', 'game development', 'gamedev', 'c#', 'blueprint', '3d', 'shader', 'physics', 'multiplayer', 'steam', 'mobile game', 'indie game', '게임', '게임개발', '유니티', '언리얼'],
      weight: 0
    },
    office: {
      keywords: ['productivity', 'office', 'excel', 'powerpoint', 'word', 'notion', 'slack', 'teams', 'automation', 'workflow', 'project management', 'agile', 'scrum', 'collaboration', 'remote work', '생산성', '오피스', '업무', '협업'],
      weight: 0
    },
    mobile: {
      keywords: ['mobile', 'react native', 'flutter', 'ios', 'android', 'swift', 'kotlin', 'app', 'application', 'xamarin', 'ionic', '모바일', '앱'],
      weight: 0
    },
    design: {
      keywords: ['design', 'ux', 'ui design', 'figma', 'sketch', 'prototype', 'user experience', 'user interface', 'branding', 'typography', 'color theory', '디자인', '사용자경험', '프로토타입'],
      weight: 0
    },
    graphics: {
      keywords: ['graphics', 'webgl', 'opengl', 'vulkan', 'directx', 'threejs', 'babylon.js', 'shader', 'glsl', 'hlsl', 'rendering', 'gpu', 'computer graphics', 'animation', 'particle', 'lighting', '그래픽', '렌더링', '셰이더', '3d'],
      weight: 0
    },
    data: {
      keywords: ['data', 'analytics', 'big data', 'data engineering', 'etl', 'data warehouse', 'spark', 'hadoop', 'kafka', 'tableau', 'power bi', 'snowflake', '데이터', '분석', '빅데이터'],
      weight: 0
    },
    security: {
      keywords: ['security', 'cybersecurity', 'authentication', 'authorization', 'encryption', 'jwt', 'oauth', 'vulnerability', 'penetration', 'zero trust', 'devsecops', '보안', '인증', '암호화'],
      weight: 0
    },
    events: {
      keywords: ['event', 'conference', 'meetup', 'workshop', 'seminar', 'hackathon', 'summit', 'webinar', 'tech talk', 'developer event', 'tech event', 'design conference', 'ux conference', 'product conference', 'startup event', 'networking', 'career event', 'live event', 'livestream', 'keynote', 'google i/o', 'wwdc', 'figma config', 'adobe max', 'microsoft build', '행사', '컨퍼런스', '미팅', '세미나', '워크샵', '해커톤', '웨비나', '기술행사', '디자인컨퍼런스', '기획자행사', '스타트업행사', '네트워킹', '커리어', '라이브', '키노트'],
      weight: 0
    }
  };

  // 각 카테고리별로 키워드 매칭 점수 계산
  for (const [category, config] of Object.entries(categoryKeywords)) {
    config.weight = config.keywords.reduce((score, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = text.match(regex);
      return score + (matches ? matches.length : 0);
    }, 0);
  }

  // 가장 높은 점수의 카테고리 선택
  const bestCategory = Object.entries(categoryKeywords)
    .sort(([,a], [,b]) => b.weight - a.weight)
    .find(([, config]) => config.weight > 0);

  return bestCategory ? bestCategory[0] : 'general';
}

// 썸네일 관련 함수들 제거됨 - 더 이상 사용하지 않음

// 개선된 큐레이션 알고리즘: 플랫폼 다양성 보장과 균형 잡힌 노출
function curateArticles(articles: Article[]): Article[] {
  // 1. 플랫폼별로 그룹화
  const articlesByPlatform = articles.reduce((acc, article) => {
    const platformId = article.platform.id;
    if (!acc[platformId]) acc[platformId] = [];
    acc[platformId].push(article);
    return acc;
  }, {} as Record<string, Article[]>);

  // 2. 각 플랫폼에서 최신순 정렬
  Object.keys(articlesByPlatform).forEach(platformId => {
    articlesByPlatform[platformId].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  });

  // 3. 플랫폼별 품질 점수 및 다양성 설정
  const platformConfig: Record<string, { 
    quality: number; 
    maxExposure: number; 
    type: 'corporate' | 'educational' | 'media' | 'community' | 'docs'
  }> = {
    // 기업 블로그 (높은 품질, 적당한 노출)
    toss: { quality: 1.2, maxExposure: 4, type: 'corporate' },
    kakao: { quality: 1.2, maxExposure: 4, type: 'corporate' },
    naver: { quality: 1.2, maxExposure: 4, type: 'corporate' },
    daangn: { quality: 1.1, maxExposure: 3, type: 'corporate' },
    woowahan: { quality: 1.1, maxExposure: 3, type: 'corporate' },
    line_blog: { quality: 1.1, maxExposure: 3, type: 'corporate' },
    coupang: { quality: 1.1, maxExposure: 3, type: 'corporate' },
    banksalad: { quality: 1.0, maxExposure: 3, type: 'corporate' },
    spoqa: { quality: 1.0, maxExposure: 3, type: 'corporate' },
    kurly: { quality: 1.1, maxExposure: 3, type: 'corporate' },
    yogiyo: { quality: 1.0, maxExposure: 3, type: 'corporate' },
    zigbang: { quality: 1.0, maxExposure: 3, type: 'corporate' },
    wanted: { quality: 1.0, maxExposure: 3, type: 'corporate' },
    musinsa: { quality: 1.0, maxExposure: 3, type: 'corporate' },
    goorm: { quality: 1.0, maxExposure: 3, type: 'corporate' },
    netmarble: { quality: 1.1, maxExposure: 3, type: 'corporate' }, // 넷마블 노출 제한
    
    // 영상 콘텐츠 (낮은 노출 - 다양성 위해 제한)
    google_dev: { quality: 0.8, maxExposure: 2, type: 'corporate' },
    line_dev: { quality: 0.8, maxExposure: 2, type: 'corporate' },
    aws_korea: { quality: 0.8, maxExposure: 2, type: 'corporate' },
    toast: { quality: 0.8, maxExposure: 2, type: 'corporate' },
    
    // 교육 유튜브 채널들 (교육 가치 높음)
    jocoding: { quality: 1.2, maxExposure: 4, type: 'educational' },
    coding_apple: { quality: 1.2, maxExposure: 4, type: 'educational' },
    nomad_coders: { quality: 1.2, maxExposure: 4, type: 'educational' },
    yalco: { quality: 1.0, maxExposure: 3, type: 'educational' },
    wony_coding: { quality: 0.9, maxExposure: 2, type: 'educational' },
    winterlood: { quality: 1.0, maxExposure: 3, type: 'educational' },
    opentutorials: { quality: 1.1, maxExposure: 4, type: 'educational' }, // 생활코딩은 좀 더 노출
    
    // 미디어 (뉴스 가치 높음)
    yozm: { quality: 1.2, maxExposure: 4, type: 'media' },
    outstanding: { quality: 1.1, maxExposure: 3, type: 'media' },
    zdnet_korea: { quality: 1.0, maxExposure: 3, type: 'media' },
    
    // 커뮤니티 (낮은 노출)
    medium: { quality: 0.8, maxExposure: 1, type: 'community' },
    velog: { quality: 0.6, maxExposure: 1, type: 'community' },
    
    // 기술 문서 (공식 문서는 높은 품질)
    aws_docs: { quality: 1.3, maxExposure: 3, type: 'docs' },
    google_cloud_docs: { quality: 1.3, maxExposure: 3, type: 'docs' },
    microsoft_docs: { quality: 1.2, maxExposure: 3, type: 'docs' },
    kubernetes_docs: { quality: 1.2, maxExposure: 2, type: 'docs' },
    python_docs: { quality: 1.3, maxExposure: 3, type: 'docs' },
    java_docs: { quality: 1.2, maxExposure: 3, type: 'docs' },
    nodejs_docs: { quality: 1.2, maxExposure: 3, type: 'docs' },
    react_docs: { quality: 1.3, maxExposure: 3, type: 'docs' },
    docker_docs: { quality: 1.2, maxExposure: 2, type: 'docs' },
    github_docs: { quality: 1.2, maxExposure: 3, type: 'docs' },
    mongodb_docs: { quality: 1.1, maxExposure: 2, type: 'docs' },
    redis_docs: { quality: 1.1, maxExposure: 2, type: 'docs' },
    digitalocean_docs: { quality: 1.1, maxExposure: 2, type: 'docs' },
    
    // 한국 기업 기술 문서
    naver_developers: { quality: 1.2, maxExposure: 3, type: 'docs' },
    kakao_developers: { quality: 1.2, maxExposure: 3, type: 'docs' },
    samsung_developers: { quality: 1.1, maxExposure: 2, type: 'docs' },
    lg_developers: { quality: 1.0, maxExposure: 2, type: 'docs' },
    nhn_developers: { quality: 1.1, maxExposure: 2, type: 'docs' },
    kt_developers: { quality: 1.0, maxExposure: 2, type: 'docs' },
    
    // AI/ML 전문 소스들
    philipp_schmid: { quality: 1.4, maxExposure: 5, type: 'corporate' }, // Google DeepMind 고품질
    hacker_news: { quality: 1.0, maxExposure: 4, type: 'community' } // 다양한 기술 뉴스
  };

  // 4. 다양성 보장을 위한 스마트 라운드 로빈
  const curatedArticles: Article[] = [];
  const platformIds = Object.keys(articlesByPlatform);
  
  // 플랫폼별 선택된 아티클 수 추적
  const selectedCounts: Record<string, number> = {};
  platformIds.forEach(id => selectedCounts[id] = 0);

  // 5. 다단계 선택 프로세스
  // 첫 번째 라운드: 각 플랫폼에서 최소 1개씩 선택 (품질 순)
  const roundOneArticles: Article[] = [];
  platformIds.forEach(platformId => {
    const platformArticles = articlesByPlatform[platformId];
    const config = platformConfig[platformId] || { quality: 1.0, maxExposure: 2, type: 'corporate' };
    
    if (platformArticles && platformArticles.length > 0) {
      roundOneArticles.push(platformArticles[0]);
      selectedCounts[platformId]++;
    }
  });

  // 두 번째 라운드: 품질과 다양성을 고려하여 추가 선택
  const remainingSlots = Math.min(120, articles.length - roundOneArticles.length); // 전체 노출 제한
  let slotsUsed = 0;
  
  for (let round = 1; round < 10 && slotsUsed < remainingSlots; round++) {
    // 플랫폼을 품질 점수와 타입 다양성으로 정렬
    const sortedPlatforms = platformIds
      .filter(platformId => {
        const config = platformConfig[platformId] || { quality: 1.0, maxExposure: 2, type: 'corporate' };
        const articleCount = articlesByPlatform[platformId]?.length || 0;
        return selectedCounts[platformId] < config.maxExposure && 
               selectedCounts[platformId] < articleCount;
      })
      .sort((a, b) => {
        const configA = platformConfig[a] || { quality: 1.0, maxExposure: 2, type: 'corporate' };
        const configB = platformConfig[b] || { quality: 1.0, maxExposure: 2, type: 'corporate' };
        
        // 타입 다양성 보너스
        const typeBonus = (type: string) => {
          const typeCounts = Object.values(curatedArticles.concat(roundOneArticles))
            .map(article => platformConfig[article.platform.id]?.type || 'corporate')
            .reduce((acc, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {} as Record<string, number>);
          
          const currentTypeCount = typeCounts[type] || 0;
          const totalArticles = curatedArticles.length + roundOneArticles.length;
          
          // 타입 비율이 낮을수록 보너스 (다양성 추구)
          return totalArticles > 0 ? 1 - (currentTypeCount / totalArticles) : 1;
        };
        
        const scoreA = configA.quality * (1 + typeBonus(configA.type) * 0.3);
        const scoreB = configB.quality * (1 + typeBonus(configB.type) * 0.3);
        
        return scoreB - scoreA;
      });

    for (const platformId of sortedPlatforms) {
      if (slotsUsed >= remainingSlots) break;
      
      const config = platformConfig[platformId] || { quality: 1.0, maxExposure: 2, type: 'corporate' };
      const platformArticles = articlesByPlatform[platformId];
      const currentCount = selectedCounts[platformId];
      
      if (currentCount < config.maxExposure && 
          currentCount < platformArticles.length) {
        
        curatedArticles.push(platformArticles[currentCount]);
        selectedCounts[platformId]++;
        slotsUsed++;
      }
    }
  }

  // 6. 첫 번째 라운드 아티클들과 합치기
  const finalArticles = [...roundOneArticles, ...curatedArticles];

  // 7. 시간 기반 정렬 (최신순, 하지만 24시간 내에서는 다양성 고려)
  return finalArticles.sort((a, b) => {
    const timeA = new Date(a.publishedAt).getTime();
    const timeB = new Date(b.publishedAt).getTime();
    const timeDiff = timeB - timeA;
    
    // 24시간 내 아티클들은 약간 섞어서 다양성 추구
    if (Math.abs(timeDiff) < 24 * 60 * 60 * 1000) {
      // 플랫폼 다양성 보너스 적용
      const platformDiversityBonus = Math.random() * 0.3;
      return (timeDiff * 0.7) + (platformDiversityBonus * timeDiff);
    }
    return timeDiff;
  });
}

// RSS 수집 함수 (캐시 우선)
export async function collectAllFeeds(): Promise<Article[]> {
  // 먼저 캐시된 데이터 확인
  const cachedArticles = await CacheManager.getCachedArticles();
  if (cachedArticles) {
    return cachedArticles;
  }

  // 캐시가 없거나 만료된 경우 새로 수집
  console.log('새로운 RSS 데이터를 수집합니다...');
  return await collectFreshFeeds();
}

// 플랫폼별 RSS 수집 함수 (타임아웃 적용)
async function collectPlatformFeed(platformKey: string, platformData: any, timeout: number = 15000): Promise<Article[]> {
  const logDisplayName = platformData.name === 'YouTube' && 'channelName' in platformData 
    ? `YouTube • ${(platformData as Record<string, unknown>).channelName}` 
    : platformData.name;

  return new Promise(async (resolve) => {
    // 타임아웃 설정
    const timeoutId = setTimeout(() => {
      console.log(`⏱️ ${logDisplayName} 타임아웃 (${timeout/1000}초)`);
      resolve([]);
    }, timeout);

    try {
      console.log(`\n--- ${logDisplayName} 수집 시작 ---`);
      console.log(`RSS URL: ${platformData.rssUrl}`);
      
      const startTime = Date.now();
      
      // 네이버 D2는 특별한 헤더가 필요
      let feed;
      if (platformKey === 'naver') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Parser = require('rss-parser');
        const customParser = new Parser({
          requestOptions: {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/atom+xml, text/xml, */*'
            },
            timeout: timeout - 2000 // 파싱 타임아웃을 전체보다 2초 짧게
          }
        });
        feed = await customParser.parseURL(platformData.rssUrl);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const Parser = require('rss-parser');
        const customParser = new Parser({
          requestOptions: {
            timeout: timeout - 2000
          }
        });
        feed = await customParser.parseURL(platformData.rssUrl);
      }
      
      const fetchTime = Date.now() - startTime;
      
      console.log(`RSS 파싱 완료 (${fetchTime}ms)`);
      console.log(`총 RSS 아이템 수: ${feed.items?.length || 0}`);
      
      // 나머지 처리 로직은 그대로 유지...
      const articles = await processPlatformItems(platformKey, platformData, feed.items || [], logDisplayName);
      
      clearTimeout(timeoutId);
      console.log(`✅ ${logDisplayName}: ${articles.length}개 수집 완료`);
      resolve(articles);
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`❌ ${logDisplayName} 수집 실패:`, error);
      resolve([]);
    }
  });
}

// 실제 RSS 수집 함수 (병렬 처리 및 최적화)
export async function collectFreshFeeds(): Promise<Article[]> {
  console.log('=== RSS 수집 시작 ===');
  const activePlatforms = Object.entries(platforms).filter(([, platformData]) => platformData.isActive);
  console.log(`활성화된 플랫폼: ${activePlatforms.length}개`);
  
  // 플랫폼들을 병렬로 처리 (최대 10개씩 배치)
  const batchSize = 10;
  const allArticles: Article[] = [];
  
  for (let i = 0; i < activePlatforms.length; i += batchSize) {
    const batch = activePlatforms.slice(i, i + batchSize);
    console.log(`\n배치 ${Math.floor(i/batchSize) + 1}: ${batch.length}개 플랫폼 처리`);
    
    const batchPromises = batch.map(([platformKey, platformData]) => 
      collectPlatformFeed(platformKey, platformData)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      } else {
        const [platformKey] = batch[index];
        console.error(`❌ 배치 처리 실패 (${platformKey}):`, result.reason);
      }
    });
    
    // 배치 간 잠시 대기 (서버 부하 분산)
    if (i + batchSize < activePlatforms.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`총 수집된 기사 수: ${allArticles.length}`);
  
  // 웹 스크래핑 추가 수집 (시간이 남으면)
  try {
    console.log('=== 자동 품질 콘텐츠 발견 시작 ===');
    const scrapedArticles = await collectScrapedArticles();
    const highQualityArticles = filterHighQualityArticles(scrapedArticles, 4.0);
    const enhancedArticles = highQualityArticles.map(article => ({
      ...article,
      tags: suggestTags(article)
    }));
    
    allArticles.push(...enhancedArticles);
    console.log(`자동 발견된 고품질 콘텐츠: ${enhancedArticles.length}개`);
  } catch (error) {
    console.error('자동 품질 콘텐츠 발견 실패:', error);
  }
  
  // 큐레이션 및 캐시 저장
  const curatedArticles = curateArticles(allArticles);
  await CacheManager.setCachedArticles(curatedArticles);
  
  console.log(`큐레이션 후 기사 수: ${curatedArticles.length}`);
  console.log('=== 수집 프로세스 완료 ===\n');
  
  return curatedArticles;
}

// 플랫폼별 아이템 처리 함수 분리
async function processPlatformItems(platformKey: string, platformData: any, items: any[], logDisplayName: string): Promise<Article[]> {
  // 미디엄만 엄격한 필터링 적용
  let itemsToProcess = items;
  
  if (platformKey === 'medium') {
    console.log('미디엄 필터링 시작...');
    const beforeFilter = items.length;
        itemsToProcess = feed.items.filter(item => {
          const title = item.title?.toLowerCase() || '';
          const content = item.content?.toLowerCase() || '';
          const summary = item.summary?.toLowerCase() || '';
          const author = item.creator?.toLowerCase() || '';
          const text = `${title} ${content} ${summary}`;
          
          // 스팸 체크: 비정상적인 문자, 반복 패턴, 숫자로만 이루어진 제목
          const spamPatterns = [
            /[\u0600-\u06FF]/, // 아랍어
            /[\u0590-\u05FF]/, // 히브리어  
            /^\d+[\u0600-\u06FF]/, // 숫자 + 아랍어
            /شماره|خاله|تهران/, // 특정 스팸 키워드
            /(.)\1{4,}/, // 같은 문자 5번 이상 반복
            /^\d{10,}/, // 10자리 이상 숫자로 시작
            /^[^\w\s]{3,}/ // 특수문자만 3개 이상
          ];
          
          const isSpam = spamPatterns.some(pattern => pattern.test(title) || pattern.test(content));
          if (isSpam) return false;
          
          // 제목이 너무 짧거나 의미없는 경우
          if (title.length < 10 || !title.match(/[a-zA-Z]/)) return false;
          
          // 개발/기술 관련 키워드 (더 엄격하게)
          const techKeywords = [
            'javascript', 'react', 'vue', 'angular', 'node.js', 'typescript', 
            'frontend', 'backend', 'development', 'programming', 'code', 'coding',
            'software', 'web development', 'api', 'database', 'algorithm',
            'html', 'css', 'python', 'java', 'framework', 'library'
          ];
          
          // 영어 본문 체크 (한국어 비율이 너무 낮으면 제외)
          const koreanCharPattern = /[가-힣]/g;
          const titleKoreanMatches = title.match(koreanCharPattern) || [];
          const contentKoreanMatches = (item.content || item.summary || '').match(koreanCharPattern) || [];
          
          const titleKoreanRatio = titleKoreanMatches.length / Math.max(title.length, 1);
          const contentKoreanRatio = contentKoreanMatches.length / Math.max((item.content || item.summary || '').length, 1);
          
          // 제목이나 내용에 한국어가 거의 없으면 제외 (영어 글 필터링)
          if (titleKoreanRatio < 0.1 && contentKoreanRatio < 0.05) return false;

          // 제외할 키워드 (확장)
          const excludeKeywords = [
            'crypto', 'bitcoin', 'trading', 'investment', 'finance', 'marketing', 
            'business', 'startup funding', 'politics', 'personal', 'life', 'story',
            'motivation', 'inspiration', 'self-help', 'career advice', 'freelance',
            'remote work', 'productivity', 'mindset'
          ];
          
          const hasTechKeyword = techKeywords.some(keyword => text.includes(keyword));
          const hasExcludeKeyword = excludeKeywords.some(keyword => text.includes(keyword));
          
          // 작가명도 체크 (스팸성 작가 필터링)
          const suspiciousAuthor = author.length > 50 || author.match(/[\u0600-\u06FF]/);
          
          return hasTechKeyword && !hasExcludeKeyword && !suspiciousAuthor;
        });
        console.log(`미디엄 필터링 완료: ${beforeFilter} -> ${itemsToProcess.length} (${itemsToProcess.length - beforeFilter} 필터됨)`);
      }

      // 플랫폼별 최대 수집 개수 제한 (균형있게 조정)
      const maxArticlesPerPlatform = {
        toss: 18,       // 토스: 기업 블로그 (품질 좋음)
        daangn: 15,     // 당근마켓: 기업 블로그
        kakao: 15,      // 카카오: 기업 블로그
        naver: 15,      // 네이버 D2: 기업 블로그  
        woowahan: 15,   // 우아한형제들: 기업 블로그
        medium: 3,      // 미디엄: 최소한으로 줄임
        // YouTube 채널들
        google_dev: 8,  // 구글 개발자 채널
        line_dev: 8,    // LINE 개발자 채널
        aws_korea: 8,   // AWS Korea
        toast: 8,       // 토스트
        // 추가 기업 기술블로그
        line_blog: 12,  // LINE 기술블로그
        coupang: 12,    // 쿠팡 기술블로그
        banksalad: 10,  // 뱅크샐러드
        spoqa: 10,      // 스포카
        kurly: 12,      // 마켓컬리
        yogiyo: 10,     // 요기요
        zigbang: 10,    // 직방
        wanted: 10,     // 원티드랩
        musinsa: 10,    // 무신사
        goorm: 10,      // 구름
        netmarble: 12,  // 넷마블
        yozm: 15,       // 요즘IT (미디어)
        velog: 5,       // 비로그 (개인 블로그)
        // 교육 유튜브 채널들
        jocoding: 10,   // 조코딩
        codingapple: 10, // 코딩애플
        yalco: 10,      // 얄팍한 코딩사전
        wony_coding: 8, // 워니코딩
        winterlood: 10, // 한입 크기로 잘라 먹는 리액트
        opentutorials: 12, // 생활코딩
        // 뉴스/미디어
        outstanding: 12, // 아웃스탠딩
        zdnet_korea: 15, // ZDNet Korea
        // 기술 문서
        aws_docs: 10,    // AWS 문서
        google_cloud_docs: 8, // Google Cloud 문서
        microsoft_docs: 8, // Microsoft 문서
        kubernetes_docs: 6, // Kubernetes 문서
        python_docs: 8,  // Python 문서
        java_docs: 8,    // Java 문서
        nodejs_docs: 8,  // Node.js 문서
        react_docs: 8,   // React 문서
        docker_docs: 8,  // Docker 문서
        github_docs: 10, // GitHub 문서
        mongodb_docs: 6, // MongoDB 문서
        redis_docs: 6,   // Redis 문서
        digitalocean_docs: 8, // DigitalOcean 문서
        // 한국 기업 기술 문서
        naver_developers: 8, // NAVER Developers
        kakao_developers: 8, // Kakao Developers
        samsung_developers: 6, // Samsung Developers
        lg_developers: 6,    // LG Developers
        nhn_developers: 8,   // NHN Developers
        kt_developers: 6,    // KT Developers
        // AI/ML 전문 소스들
        philipp_schmid: 8,   // Philipp Schmid Blog (고품질)
        hacker_news: 12      // Hacker News (다양한 기술 뉴스)
      };
      
      const maxArticles = maxArticlesPerPlatform[platformKey as keyof typeof maxArticlesPerPlatform] || 15;
      const maxDisplayName = platformData.name === 'YouTube' && 'channelName' in platformData 
        ? `YouTube • ${(platformData as Record<string, unknown>).channelName}` 
        : platformData.name;
      console.log(`${maxDisplayName} 최대 수집 개수: ${maxArticles}, 실제 처리할 아이템: ${Math.min(maxArticles, itemsToProcess.length)}`);
      const articles = itemsToProcess.slice(0, maxArticles).map((item, index) => {
        const authorCompanyName = platformData.name === 'YouTube' && 'channelName' in platformData 
          ? (platformData as Record<string, unknown>).channelName 
          : platformData.name;
        const defaultAuthor: Author = {
          id: `${platformKey}-author`,
          name: item.creator || item.author || `${authorCompanyName} 작가`,
          company: String(authorCompanyName),
          expertise: ['Tech'],
          articleCount: 0
        };

        const platform: Platform = {
          ...platformData,
          lastCrawled: new Date()
        };

        const title = item.title || '제목 없음';
        const rawContent = item['content:encoded'] || item.content || item.summary || '';
        const content = stripHtmlAndClean(rawContent);
        const originalTags = item.categories || ['Tech'];
        const category = categorizeArticle(title, content, originalTags);
        const smartTags = generateSmartTags(title, content, originalTags, category);
        
        // YouTube 채널인지 확인
        const isYouTubeChannel = [
          'google_dev', 'line_dev', 'aws_korea', 'toast',
          'jocoding', 'codingapple', 'yalco', 'wony_coding', 'winterlood', 'opentutorials'
        ].includes(platformKey);
        const videoId = isYouTubeChannel && item.link ? extractVideoId(item.link) : null;
        
        const baseArticle = {
          id: `${platformKey}-${index}`,
          title: stripHtmlAndClean(title),
          content,
          excerpt: generateExcerpt(rawContent),
          author: defaultAuthor,
          platform,
          category: category as ArticleCategory,
          tags: smartTags,
          publishedAt: new Date(item.pubDate || Date.now()),
          viewCount: Math.floor(Math.random() * 5000) + 1000,
          likeCount: Math.floor(Math.random() * 200) + 50,
          commentCount: Math.floor(Math.random() * 50) + 5,
          readingTime: Math.floor(Math.random() * 15) + 5,
          trending: Math.random() > 0.7,
          featured: Math.random() > 0.8,
          url: item.link || platformData.baseUrl,
          contentType: isYouTubeChannel ? 'video' as const : 'article' as const
        };
        
        // YouTube 영상인 경우 추가 필드
        if (isYouTubeChannel && videoId) {
          return {
            ...baseArticle,
            videoUrl: item.link,
            videoDuration: estimateVideoDuration(),
            thumbnailUrl: getYoutubeThumbnail(videoId),
            watchCount: Math.floor(Math.random() * 50000) + 5000 // 영상 조회수
          };
        }
        
        return baseArticle;
      });

      allArticles.push(...articles);
      console.log(`✅ ${maxDisplayName}: ${articles.length}개 수집 완료`);
      console.log(`--- ${maxDisplayName} 수집 종료 ---\n`);
      
    } catch (error) {
      console.error(`❌ ${logDisplayName} 수집 실패:`, error);
      console.error(`RSS URL: ${platformData.rssUrl}`);
      if (error instanceof Error) {
        console.error(`에러 메시지: ${error.message}`);
        console.error(`에러 스택: ${error.stack?.slice(0, 300)}`);
      }
      console.log(`--- ${logDisplayName} 수집 종료 (실패) ---\n`);
    }
  }

  console.log('=== RSS 수집 완료 ===');
  console.log(`총 수집된 기사 수: ${allArticles.length}`);
  
  // 플랫폼별 분포 확인
  const platformDistribution = allArticles.reduce((acc, article) => {
    const displayName = article.platform.name === 'YouTube' && article.platform.channelName
      ? `YouTube • ${article.platform.channelName}`
      : article.platform.name;
    acc[displayName] = (acc[displayName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('플랫폼별 분포:', platformDistribution);
  
  // 웹 스크래핑 추가 수집 (자동 품질 콘텐츠 발견)
  console.log('=== 자동 품질 콘텐츠 발견 시작 ===');
  try {
    const scrapedArticles = await collectScrapedArticles();
    
    // 품질 점수 기반 필터링 적용
    const highQualityArticles = filterHighQualityArticles(scrapedArticles, 4.0);
    
    // 태그 자동 제안 적용
    const enhancedArticles = highQualityArticles.map(article => ({
      ...article,
      tags: suggestTags(article)
    }));
    
    allArticles.push(...enhancedArticles);
    console.log(`자동 발견된 고품질 콘텐츠: ${enhancedArticles.length}개 (원본: ${scrapedArticles.length}개)`);
  } catch (error) {
    console.error('자동 품질 콘텐츠 발견 실패:', error);
  }
  
  // 큐레이션 알고리즘: 다양성과 품질을 고려한 정렬
  const curatedArticles = curateArticles(allArticles);

  // 새로 수집한 데이터를 캐시에 저장
  await CacheManager.setCachedArticles(curatedArticles);

  console.log(`큐레이션 후 기사 수: ${curatedArticles.length}`);
  console.log('=== 수집 프로세스 완료 ===\n');
  
  return curatedArticles;
}