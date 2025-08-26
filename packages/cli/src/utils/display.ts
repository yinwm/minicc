import chalk from 'chalk';
import AsciiChart from 'ascii-chart';
import Table from 'cli-table3';

export function displayData(data: any, type: string = 'table') {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('没有数据'));
    return;
  }

  switch (type) {
    case 'chart':
      displayChart(data);
      break;
    case 'table':
    default:
      displayTable(data);
      break;
  }
}

function displayTable(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) {
    console.log(chalk.yellow('没有表格数据'));
    return;
  }

  // 获取所有列名
  const columns = Object.keys(data[0]);
  
  // 创建表格
  const table = new Table({
    head: columns.map(col => chalk.cyan(col)),
    style: {
      head: [],
      border: []
    }
  });

  // 添加数据行
  data.forEach(row => {
    const values = columns.map(col => {
      const value = row[col];
      if (typeof value === 'number') {
        return chalk.yellow(value.toLocaleString());
      }
      return value?.toString() || '';
    });
    table.push(values);
  });

  console.log(table.toString());
}

function displayChart(data: any[]) {
  if (!Array.isArray(data) || data.length === 0) {
    console.log(chalk.yellow('没有图表数据'));
    return;
  }

  // 尝试找到数值列
  const firstRow = data[0];
  const numericColumns = Object.keys(firstRow).filter(key => 
    typeof firstRow[key] === 'number'
  );

  if (numericColumns.length === 0) {
    console.log(chalk.yellow('没有可用于图表的数值数据'));
    displayTable(data); // 退回到表格显示
    return;
  }

  // 使用第一个数值列创建图表
  const valueColumn = numericColumns[0];
  const values = data.map(row => row[valueColumn]);
  
  // 创建 ASCII 图表
  const chart = new AsciiChart({
    width: 60,
    height: 10,
    padding: '  '
  });

  console.log(chalk.cyan(`\n图表: ${valueColumn}\n`));
  console.log(chart.plot(values));

  // 显示数据标签
  const labelColumn = Object.keys(firstRow).find(key => 
    typeof firstRow[key] === 'string'
  );
  
  if (labelColumn) {
    console.log(chalk.gray('\n标签:'));
    data.forEach((row, index) => {
      console.log(chalk.gray(`  ${index + 1}. ${row[labelColumn]}: ${row[valueColumn]}`));
    });
  }
}

export function displayProgress(tasks: string[]) {
  const Listr = require('listr2').Listr;
  
  const taskList = tasks.map(task => ({
    title: task,
    task: async () => {
      // 这里可以添加实际的任务执行逻辑
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }));

  const listr = new Listr(taskList, {
    concurrent: false,
    exitOnError: false
  });

  return listr.run();
}