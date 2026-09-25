import express from 'express';
import YahooFinance from 'yahoo-finance2';

const app = express();
const PORT = process.env.PORT || 3001;
const yahooFinance = new YahooFinance();

// Basic CORS middleware
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// GET /api/chart/:symbol?range=1d&interval=15m
app.get('/api/chart/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const range = req.query.range || '1d';
  const interval = req.query.interval || '15m';

  try {
    const queryOptions = {
      interval: interval === '15m' ? '15m' : interval === '1d' ? '1d' : '1wk',
    };

    const now = new Date();
    if (range === '1d') {
      queryOptions.period1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (range === '5d' || range === '7d') {
      queryOptions.period1 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '3mo' || range === '1q') {
      queryOptions.period1 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const chartResult = await yahooFinance.chart(symbol, queryOptions);

    res.json({
      chart: {
        result: [chartResult],
        error: null,
      },
    });
  } catch (error) {
    console.error(`Error fetching chart for ${symbol}:`, error?.message || error);
    res.status(500).json({
      chart: {
        result: null,
        error: {
          code: 'FETCH_ERROR',
          description: error?.message || 'Failed to fetch Yahoo Finance data',
        },
      },
    });
  }
});

// GET /api/quotes?symbols=IBM,MSFT...
app.get('/api/quotes', async (req, res) => {
  const symbolsQuery = req.query.symbols;
  if (!symbolsQuery) {
    return res.status(400).json({ error: 'symbols query parameter required' });
  }

  const symbols = symbolsQuery.split(',').map((s) => s.trim().toUpperCase());

  try {
    const results = {};
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await yahooFinance.quote(symbol);
          results[symbol] = {
            symbol: quote.symbol,
            name: quote.shortName || quote.longName || `${quote.symbol} Corp.`,
            currentPrice: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            percentChange: quote.regularMarketChangePercent,
            open: quote.regularMarketOpen,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            volume: quote.regularMarketVolume,
            previousClose: quote.regularMarketPreviousClose,
            lastUpdated: new Date().toLocaleTimeString(),
          };
        } catch (err) {
          console.warn(`Could not quote ${symbol}:`, err?.message);
        }
      })
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error?.message || 'Quote fetch failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Yahoo Finance proxy server running at http://localhost:${PORT}`);
});
