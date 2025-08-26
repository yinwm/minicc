declare module 'ascii-chart' {
  interface ChartConfig {
    width?: number;
    height?: number;
    offset?: number;
    padding?: string;
    colors?: string[];
  }
  
  class Chart {
    constructor(config?: ChartConfig);
    plot(data: number[]): string;
  }
  
  export = Chart;
}