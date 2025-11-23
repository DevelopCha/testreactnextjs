# 브랜드 페이지 구현

## 🎯 학습 목표
- **이미지 최적화**: 자동 크기 조정, 지연 로딩 및 형식 변환(WebP)을 위해 `next/image` 사용.
- **CLS 방지**: `next/image`는 누적 레이아웃 이동(Cumulative Layout Shift)을 방지하기 위해 치수(또는 부모 컨테이너와 함께 `fill`)가 필요합니다.

## 🛠️ 구현 로직
1. **Next/Image**: 표준 `<img>` 태그를 대체합니다.
2. **Fill 모드**: `object-cover`와 결합하여 부모 컨테이너의 크기에 맞추기 위해 `fill` prop을 사용합니다.
3. **우선순위**: LCP(Largest Contentful Paint) 이미지를 `priority`로 표시하여 미리 로드합니다.

## 💡 팁
- 뷰포트에 맞는 올바른 이미지 크기를 브라우저가 다운로드할 수 있도록 `fill`을 사용할 때는 항상 `sizes`를 정의하세요.
