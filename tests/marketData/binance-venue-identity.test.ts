import {describe,it,expect,vi,afterEach} from 'vitest';
import {BinanceProvider} from '../../src/marketData/Binance/BinanceProvider.class';
const info={symbols:[{symbol:'BTCUSDT',baseAsset:'BTC',quoteAsset:'USDT',filters:[{filterType:'PRICE_FILTER',tickSize:'.01'},{filterType:'LOT_SIZE',minQty:'.00001'}]}]};
const candles=[[1704067200000,'100','102','99','101','10',1704067259999,'1',1,'1','1','0']];
afterEach(()=>vi.unstubAllGlobals());
describe('Binance venue identity',()=>{
 it('never substitutes another venue when the requested exchange is unavailable',async()=>{
  const calls:string[]=[];vi.stubGlobal('fetch',async(url:any)=>{calls.push(String(url));return String(url).startsWith('https://api.binance.us/')?{ok:true,status:200,json:async()=>String(url).includes('exchangeInfo')?info:String(url).includes('/ping')?{}:candles}:{ok:false,status:451,json:async()=>({})};});
  const provider=new BinanceProvider();expect(await provider.getMarketData('BTCUSDT','1',1)).toEqual([]);expect(await provider.getSymbolInfo('BTCUSDT')).toBeNull();expect(calls.every(url=>url.startsWith('https://api.binance.com/'))).toBe(true);
 });
 it('preserves original exchange bars and metadata when available',async()=>{
  const calls:string[]=[];vi.stubGlobal('fetch',async(url:any)=>{calls.push(String(url));return {ok:true,status:200,json:async()=>String(url).includes('exchangeInfo')?info:String(url).includes('/ping')?{}:candles};});
  const provider=new BinanceProvider();expect((await provider.getMarketData('BTCUSDT','1',1))[0].close).toBe(101);expect((await provider.getSymbolInfo('BTCUSDT'))?.tickerid).toBe('BINANCE:BTCUSDT');expect(calls.every(url=>url.startsWith('https://api.binance.com/'))).toBe(true);
 });
});
