import { useEffect, useMemo, useState } from 'react';
import { getProduct, getProducts } from './api';

const CATEGORIES = ['전체', '감기', '진통제', '안약', '파스', '소화', '피부', '비타민'];

function FeedAd() {
  return (
    <section className="feed-ad" aria-label="피드형 광고">
      <div>
        <strong>앱인토스 피드형 광고</strong>
        <span>실제 SDK 연동 시 이 영역이 광고로 교체됩니다.</span>
      </div>
    </section>
  );
}

function BottomAd() {
  return (
    <div className="bottom-ad" aria-label="하단 고정 광고">
      <strong>토스 하단 고정 배너 광고</strong>
      <span>실제 토스 광고 영역</span>
    </div>
  );
}

function StoreBadges({ stores, compact = false }) {
  if (!stores?.length) {
    return <span className="store-empty">판매처 확인 중</span>;
  }

  return (
    <div className={`store-badges ${compact ? 'compact' : ''}`}>
      {stores.map((store) => (
        <span className="store-badge" key={store.slug}>
          {store.name}
        </span>
      ))}
    </div>
  );
}

function ProductCard({ product, onOpen }) {
  return (
    <button className="product-card" onClick={() => onOpen(product.id)}>
      <div className="product-image" aria-hidden="true">
        {product.emoji}
      </div>

      <div className="product-body">
        <div className="product-meta">
          {product.brand} · {product.category}
        </div>
        <strong className="product-name">{product.nameKo}</strong>
        <p className="product-description">{product.summary}</p>

        <div className="buy-label">어디서 살 수 있나요?</div>
        <StoreBadges stores={product.stores} compact />

        <div className="tag-row">
          {product.tags.slice(0, 3).map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <span className="card-arrow">›</span>
    </button>
  );
}

function SkeletonList() {
  return (
    <div className="skeleton-list">
      {[1, 2, 3, 4].map((item) => (
        <div className="skeleton-card" key={item}>
          <div className="skeleton skeleton-image" />
          <div className="skeleton-copy">
            <div className="skeleton line short" />
            <div className="skeleton line medium" />
            <div className="skeleton line long" />
            <div className="skeleton line medium" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Home({
  products,
  loading,
  error,
  category,
  query,
  onCategoryChange,
  onQueryChange,
  onRetry,
  onOpen,
}) {
  const firstGroup = products.slice(0, 4);
  const secondGroup = products.slice(4);

  return (
    <div className="screen-page">
      <header className="app-bar">
        <strong>일본 드럭스토어 뭐사지?</strong>
        <button className="icon-button" aria-label="저장 상품">
          ♡
        </button>
      </header>

      <main className="scroll-area">
        <section className="hero">
          <span>한국인이 많이 찾는 일본 드럭스토어 상품</span>
          <h1>
            상품명보다
            <br />
            증상으로 찾아보세요
          </h1>
          <p>효능·사용법·주의사항과 판매처를 한국어로 확인</p>
          <div className="hero-emoji">💊</div>
        </section>

        <label className="search-box">
          <span aria-hidden="true">🔍</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="상품명, 증상 또는 매장 검색"
          />
          {query && (
            <button
              type="button"
              className="clear-button"
              onClick={() => onQueryChange('')}
              aria-label="검색어 지우기"
            >
              ×
            </button>
          )}
        </label>

        <div className="category-scroll">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              className={`category-chip ${category === item ? 'active' : ''}`}
              onClick={() => onCategoryChange(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <section className="content-section">
          <div className="section-title">
            <div>
              <span className="section-kicker">일본 여행 쇼핑 가이드</span>
              <h2>{query ? '검색 결과' : '많이 찾는 상품'}</h2>
            </div>
            {!loading && !error && <span>{products.length}개</span>}
          </div>

          {loading && <SkeletonList />}

          {!loading && error && (
            <div className="state-card">
              <strong>상품을 불러오지 못했어요</strong>
              <p>{error}</p>
              <button onClick={onRetry}>다시 시도</button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="state-card">
              <strong>검색 결과가 없어요</strong>
              <p>상품명, 증상 또는 매장명을 다르게 검색해 보세요.</p>
            </div>
          )}

          {!loading &&
            !error &&
            firstGroup.map((product) => (
              <ProductCard key={product.id} product={product} onOpen={onOpen} />
            ))}
        </section>

        {!loading && !error && products.length >= 4 && <FeedAd />}

        {!loading && !error && secondGroup.length > 0 && (
          <section className="content-section secondary">
            {secondGroup.map((product) => (
              <ProductCard key={product.id} product={product} onOpen={onOpen} />
            ))}
          </section>
        )}

        <div className="safe-bottom-space" />
      </main>

      <BottomAd />
    </div>
  );
}

function Detail({ product, loading, error, onBack, onRetry }) {
  return (
    <div className="screen-page">
      <header className="app-bar detail-bar">
        <button className="icon-button" onClick={onBack} aria-label="뒤로가기">
          ‹
        </button>
        <strong>상품 상세</strong>
        <button className="icon-button" aria-label="상품 저장">
          ♡
        </button>
      </header>

      <main className="scroll-area">
        {loading && <SkeletonList />}

        {!loading && error && (
          <div className="state-card detail-state">
            <strong>상품 정보를 불러오지 못했어요</strong>
            <p>{error}</p>
            <button onClick={onRetry}>다시 시도</button>
          </div>
        )}

        {!loading && !error && product && (
          <>
            <section className="detail-hero">
              <div className="detail-image">{product.emoji}</div>
              <span className="product-meta">
                {product.brand} · {product.category}
              </span>
              <h1>{product.nameKo}</h1>
              <p className="japanese-name">{product.nameJa}</p>

              <div className="summary-box">{product.summary}</div>
            </section>

            <section className="detail-section">
              <h2>어디서 살 수 있나요?</h2>
              <p className="section-description">
                상품 취급 여부와 재고는 지점별로 다를 수 있습니다.
              </p>

              <div className="store-list">
                {product.stores.map((store) => (
                  <div className="store-row" key={store.slug}>
                    <div>
                      <strong>{store.name}</strong>
                      <span>{store.note}</span>
                    </div>
                    <span className={`availability ${store.availability}`}>
                      {store.availabilityLabel}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h2>이럴 때 사용해요</h2>
              <ul className="info-list">
                {product.uses.map((item) => (
                  <li key={item}>✓ {item}</li>
                ))}
              </ul>
            </section>

            <section className="detail-section">
              <h2>사용 방법</h2>
              <ol className="number-list">
                {product.howToUse.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </section>

            <FeedAd />

            <section className="detail-section">
              <h2>주의사항</h2>
              <div className="warning-box">{product.caution}</div>
            </section>

            <section className="detail-section">
              <h2>이런 사람에게 맞아요</h2>
              <div className="recommend-grid">
                <div className="recommend-card">
                  <strong>추천</strong>
                  <span>{product.recommendation}</span>
                </div>
                <div className="recommend-card">
                  <strong>주의</strong>
                  <span>{product.notRecommended}</span>
                </div>
              </div>
            </section>

            <div className="safe-bottom-space" />
          </>
        )}
      </main>

      <BottomAd />
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [category, setCategory] = useState('전체');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [listState, setListState] = useState({ loading: true, error: '' });
  const [detailState, setDetailState] = useState({ loading: false, error: '' });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;

    setListState({ loading: true, error: '' });

    getProducts({ category, query: debouncedQuery })
      .then((data) => {
        if (!cancelled) {
          setProducts(data.items);
          setListState({ loading: false, error: '' });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setListState({ loading: false, error: error.message });
        }
      });

    return () => {
      cancelled = true
    };
  }, [category, debouncedQuery, refreshKey]);

  const openProduct = (id) => {
    setView('detail');
    setSelectedId(id);
    setSelectedProduct(null);
    setDetailState({ loading: true, error: '' });

    getProduct(id)
      .then((data) => {
        setSelectedProduct(data.item);
        setDetailState({ loading: false, error: '' });
      })
      .catch((error) => {
        setDetailState({ loading: false, error: error.message });
      });
  };

  const retryDetail = () => {
    if (selectedId) {
      openProduct(selectedId);
    }
  };

  return (
    <div className="app-shell">
      <div className="phone-frame">
        {view === 'home' ? (
          <Home
            products={products}
            loading={listState.loading}
            error={listState.error}
            category={category}
            query={query}
            onCategoryChange={setCategory}
            onQueryChange={setQuery}
            onRetry={() => setRefreshKey((key) => key + 1)}
            onOpen={openProduct}
          />
        ) : (
          <Detail
            product={selectedProduct}
            loading={detailState.loading}
            error={detailState.error}
            onBack={() => setView('home')}
            onRetry={retryDetail}
          />
        )}
      </div>
    </div>
  );
}
