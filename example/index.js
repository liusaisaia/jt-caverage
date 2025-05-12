// 示例：如何在React应用中使用dev-coverage包
import React, { useEffect } from 'react';
import { setupManualSave, startCoveragePolling, collectFinalCoverage } from 'dev-coverage';

// 在应用入口处初始化覆盖率收集工具
setupManualSave();

// 开始定期收集覆盖率数据（可选）
startCoveragePolling(30000); // 每30秒收集一次

function App() {
  useEffect(() => {
    // 组件卸载时收集最终覆盖率数据
    return () => {
      collectFinalCoverage();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>覆盖率收集示例</h1>
        <p>
          打开控制台查看覆盖率数据收集情况。
          您也可以通过调用 <code>window.saveCoverage()</code> 手动保存当前覆盖率数据。
        </p>
        <button onClick={() => window.saveCoverage()}>保存覆盖率数据</button>
      </header>
    </div>
  );
}

export default App;