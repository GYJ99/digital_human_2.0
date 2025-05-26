// (注释：单元测试脚本)
// (Comment: Unit Test Script)

async function runUnitTests() {
    console.log("--- 开始单元测试 ---"); // --- Starting Unit Tests ---
    let passed = 0;
    let failed = 0;
    const testResults = []; 

    // 断言助手函数 (Assertion helper function)
    function assert(condition, message, details = '') {
        if (condition) {
            console.log(`✅ 测试通过: ${message}`); 
            testResults.push({ name: message, status: '通过 (Passed)', details: '' });
            passed++;
        } else {
            const failureDetails = details ? `详细信息: ${JSON.stringify(details)}` : '断言失败 (Assertion failed)';
            console.error(`❌ 测试失败: ${message}. ${failureDetails}`); 
            testResults.push({ name: message, status: '失败 (Failed)', details: failureDetails });
            failed++;
        }
    }

    // --- 测试套件 1: floatTo16BitPCM ---
    console.log("\n--- 测试套件: floatTo16BitPCM ---");
    if (typeof window.floatTo16BitPCM === 'function') {
        testFloatTo16BitPCM(assert);
    } else {
        const msg = "floatTo16BitPCM 函数未定义或无法访问。跳过此测试套件。";
        console.error(`❌ ${msg}`);
        testResults.push({ name: "floatTo16BitPCM 测试套件", status: '跳过 (Skipped)', details: msg });
        failed++; 
    }

    // --- 测试套件 2: Dify集成 ---
    console.log("\n--- 测试套件: Dify集成 ---");
    if (typeof window.sendMessageToDify === 'function' && 
        typeof window.addMessageToChat === 'function' &&
        typeof window.playTextAsSpeech === 'function' &&
        typeof window.switchToAnimation === 'function' &&
        window.hasOwnProperty('isRecordingPublic') && // Check for the property itself
        typeof window.LISTENING_ANIMATION_NAME_FOR_TEST !== 'undefined' &&
        typeof window.DEFAULT_ANIMATION_NAME_FOR_TEST !== 'undefined') {
        await testDifyIntegration(assert);
    } else {
        let missing = [];
        if (typeof window.sendMessageToDify !== 'function') missing.push('sendMessageToDify');
        if (typeof window.addMessageToChat !== 'function') missing.push('addMessageToChat');
        if (typeof window.playTextAsSpeech !== 'function') missing.push('playTextAsSpeech');
        if (typeof window.switchToAnimation !== 'function') missing.push('switchToAnimation');
        if (!window.hasOwnProperty('isRecordingPublic')) missing.push('isRecordingPublic');
        if (typeof window.LISTENING_ANIMATION_NAME_FOR_TEST === 'undefined') missing.push('LISTENING_ANIMATION_NAME_FOR_TEST');
        if (typeof window.DEFAULT_ANIMATION_NAME_FOR_TEST === 'undefined') missing.push('DEFAULT_ANIMATION_NAME_FOR_TEST');
        
        const msg = `Dify 集成测试所需的一个或多个核心函数/变量 (${missing.join(', ')}) 未定义或无法访问。跳过此测试套件。`;
        console.error(`❌ ${msg}`);
        testResults.push({ name: "Dify 集成测试套件", status: '跳过 (Skipped)', details: msg });
        failed++;
    }
    
    // --- 单元测试总结 ---
    console.log("\n--- 单元测试总结 ---");
    testResults.forEach(result => {
        const logFn = result.status === '失败 (Failed)' || result.status === '跳过 (Skipped)' ? console.error : 
                      result.status === '待办 (TODO)' ? console.warn : console.log;
        logFn(`- ${result.name}: ${result.status} ${result.details || ''}`);
    });
    const skippedOrTodoCount = testResults.filter(r => r.status === '待办 (TODO)' || r.status === '跳过 (Skipped)').length;
    console.log(`\n总计: 通过: ${passed}, 失败: ${failed}, 待办/跳过: ${skippedOrTodoCount}`);
    console.log("--- 单元测试结束 ---");

    // 将结果显示在页面上 (Display results on the page)
    const resultsDivId = 'unit-test-results';
    let resultsDiv = document.getElementById(resultsDivId);
    if (!resultsDiv) {
        resultsDiv = document.createElement('div');
        resultsDiv.id = resultsDivId;
        // Styles for resultsDiv (same as before, ensure it's readable)
        resultsDiv.style.position = 'fixed';
        resultsDiv.style.bottom = '10px';
        resultsDiv.style.left = '10px';
        resultsDiv.style.width = 'calc(100% - 40px)';
        resultsDiv.style.maxHeight = '250px';
        resultsDiv.style.overflowY = 'auto';
        resultsDiv.style.backgroundColor = 'rgba(20,20,20,0.9)';
        resultsDiv.style.color = '#eee';
        resultsDiv.style.padding = '15px';
        resultsDiv.style.zIndex = '1999'; 
        resultsDiv.style.border = '1px solid #555';
        resultsDiv.style.borderRadius = '8px';
        resultsDiv.style.fontFamily = 'monospace';
        resultsDiv.style.fontSize = '14px';
        document.body.appendChild(resultsDiv);
    }
    resultsDiv.innerHTML = `<h3>单元测试结果 (Unit Test Results): 通过 (Passed) ${passed}, 失败 (Failed) ${failed}, 待办/跳过 (TODO/Skipped) ${skippedOrTodoCount}</h3><hr>`;
    testResults.forEach(r => {
        const p = document.createElement('p');
        let statusColor = '#eee'; 
        if (r.status === '失败 (Failed)' || r.status === '跳过 (Skipped)') statusColor = '#ff7b7b'; 
        else if (r.status === '通过 (Passed)') statusColor = '#7bff7b'; 
        else if (r.status === '待办 (TODO)') statusColor = '#ffff7b'; 
        p.style.color = statusColor;
        p.style.margin = '5px 0';
        p.style.whiteSpace = 'pre-wrap'; 
        p.textContent = `${r.name}: ${r.status} ${r.details || ''}`;
        resultsDiv.appendChild(p);
    });
    resultsDiv.scrollTop = resultsDiv.scrollHeight; 
}

function testFloatTo16BitPCM(assert) {
    const sampleInput1 = new Float32Array([0.0, 1.0, -1.0, 0.5, -0.25]);
    const expectedOutput1 = new Int16Array([0, 32767, -32768, 16383, -8192]);
    const actualOutput1 = window.floatTo16BitPCM(sampleInput1);
    assert(actualOutput1.length === expectedOutput1.length, "floatTo16BitPCM (用例1): 输出长度应与输入长度匹配");
    let allMatch1 = true;
    let mismatchDetails1 = [];
    for (let i = 0; i < expectedOutput1.length; i++) {
        if (actualOutput1[i] !== expectedOutput1[i]) {
            allMatch1 = false;
            mismatchDetails1.push({index: i, expected: expectedOutput1[i], actual: actualOutput1[i]});
        }
    }
    assert(allMatch1, "floatTo16BitPCM (用例1): 所有转换值应正确", allMatch1 ? '' : mismatchDetails1);

    const sampleInput2 = new Float32Array([0.0, 0.0, 0.0]);
    const expectedOutput2 = new Int16Array([0, 0, 0]);
    const actualOutput2 = window.floatTo16BitPCM(sampleInput2);
    assert(actualOutput2.length === expectedOutput2.length, "floatTo16BitPCM (用例2): 零值数组长度");
    let allMatch2 = true;
    for (let i = 0; i < expectedOutput2.length; i++) { if (actualOutput2[i] !== expectedOutput2[i]) { allMatch2 = false; break; }}
    assert(allMatch2, "floatTo16BitPCM (用例2): 所有零值应转换为0");

    const sampleInput3 = new Float32Array([]);
    const expectedOutput3 = new Int16Array([]);
    const actualOutput3 = window.floatTo16BitPCM(sampleInput3);
    assert(actualOutput3.length === expectedOutput3.length, "floatTo16BitPCM (用例3): 空数组输入应产生空数组输出");

    const sampleInput4 = new Float32Array([1.5, -2.0, 0.99999, -0.99999]); 
    const expectedOutput4 = new Int16Array([32767, -32768, 32767, -32767]);
    const actualOutput4 = window.floatTo16BitPCM(sampleInput4);
    assert(actualOutput4.length === expectedOutput4.length, "floatTo16BitPCM (用例4): 截断测试数组长度");
    assert(actualOutput4[0] === expectedOutput4[0], `floatTo16BitPCM (用例4): 正向截断 (${sampleInput4[0]} -> ${expectedOutput4[0]})`);
    assert(actualOutput4[1] === expectedOutput4[1], `floatTo16BitPCM (用例4): 负向截断 (${sampleInput4[1]} -> ${expectedOutput4[1]})`);
    assert(actualOutput4[2] === expectedOutput4[2], `floatTo16BitPCM (用例4): 接近1的正值 (${sampleInput4[2]} -> ${expectedOutput4[2]})`);
    assert(actualOutput4[3] === expectedOutput4[3], `floatTo16BitPCM (用例4): 接近-1的负值 (${sampleInput4[3]} -> ${expectedOutput4[3]})`);
}

async function testDifyIntegration(assert) {
    // 备份原始函数和状态 (Backup original functions and state)
    const originalFetch = window.fetch;
    const originalAddMessageToChat = window.addMessageToChat;
    const originalPlayTextAsSpeech = window.playTextAsSpeech;
    const originalSwitchToAnimation = window.switchToAnimation;
    const originalIsRecording = window.isRecordingPublic; // 使用暴露的属性 (Use exposed property)

    let addMessageCalls, playSpeechCalls, animationCalls;

    // 辅助函数：重置模拟和调用记录 (Helper function: Reset mocks and call records)
    const setupMocks = () => {
        addMessageCalls = [];
        playSpeechCalls = [];
        animationCalls = [];
        window.addMessageToChat = (msg, sender) => { addMessageCalls.push({msg, sender}); };
        window.playTextAsSpeech = async (text) => { playSpeechCalls.push(text); return Promise.resolve(); };
        window.switchToAnimation = (animationName) => { animationCalls.push(animationName);};
        window.isRecordingPublic = false; // 默认测试时 STT 不激活 (STT not active during tests by default)
    };

    const listeningAnimName = window.LISTENING_ANIMATION_NAME_FOR_TEST;
    const defaultAnimName = window.DEFAULT_ANIMATION_NAME_FOR_TEST;

    // --- 测试用例 1: Dify 调用成功 ---
    console.log("\n--- Dify集成 - 用例1: 调用成功 ---");
    setupMocks();
    window.fetch = () => Promise.resolve({ 
        ok: true, 
        json: () => Promise.resolve({ answer: "Dify的模拟回复" }) 
    });
    await window.sendMessageToDify("用户测试消息1");
    
    assert(addMessageCalls.length === 2, "Dify成功: addMessageToChat 调用次数应为2 (用户消息 + Dify回复)", addMessageCalls);
    if(addMessageCalls.length === 2) {
        assert(addMessageCalls[0].msg === "用户测试消息1" && addMessageCalls[0].sender === "user", "Dify成功: 用户消息已正确显示");
        assert(addMessageCalls[1].msg === "Dify的模拟回复" && addMessageCalls[1].sender === "dify", "Dify成功: Dify回复已正确显示");
    }
    assert(playSpeechCalls.length === 1, "Dify成功: playTextAsSpeech 调用次数应为1", playSpeechCalls);
    if(playSpeechCalls.length === 1) {
        assert(playSpeechCalls[0] === "Dify的模拟回复", "Dify成功: TTS已使用Dify回复正确调用");
    }
    assert(animationCalls.includes(listeningAnimName), `Dify成功: 开始时应切换到 ${listeningAnimName} 动画`);
    // 假设 playTextAsSpeech 完成后 (或如果 STT 未激活) 会切换回默认动画
    // (Assuming after playTextAsSpeech completes (or if STT not active), it switches back to default animation)
    // 这个断言依赖于 playTextAsSpeech 模拟的 Promise 解析后，sendMessageToDify 中的逻辑
    // (This assertion depends on logic in sendMessageToDify after the mocked playTextAsSpeech Promise resolves)
    assert(animationCalls.some(call => call === defaultAnimName && animationCalls.indexOf(call) > animationCalls.indexOf(listeningAnimName)), 
           `Dify成功: 结束后应切换到 ${defaultAnimName} 动画 (假设STT未激活)`);


    // --- 测试用例 2: Dify API 返回错误 ---
    console.log("\n--- Dify集成 - 用例2: API错误 ---");
    setupMocks();
    window.fetch = () => Promise.resolve({ 
        ok: false, 
        status: 500, 
        text: () => Promise.resolve("服务器内部错误") 
    });
    await window.sendMessageToDify("用户测试消息2");

    assert(addMessageCalls.length === 2, "Dify API错误: addMessageToChat 调用次数应为2 (用户消息 + 错误消息)", addMessageCalls);
    if(addMessageCalls.length === 2) {
        assert(addMessageCalls[0].msg === "用户测试消息2" && addMessageCalls[0].sender === "user", "Dify API错误: 用户消息应已显示");
        assert(addMessageCalls[1].msg.includes("Dify API请求错误: 500") || addMessageCalls[1].msg.includes("服务器内部错误"), "Dify API错误: 应显示错误消息");
    }
    assert(playSpeechCalls.length === 0, "Dify API错误: playTextAsSpeech 不应被调用", playSpeechCalls);
    assert(animationCalls.includes(listeningAnimName), `Dify API错误: 开始时应切换到 ${listeningAnimName} 动画`);
    assert(animationCalls.some(call => call === defaultAnimName && animationCalls.indexOf(call) > animationCalls.indexOf(listeningAnimName)), 
           `Dify API错误: 结束后应切换到 ${defaultAnimName} 动画 (假设STT未激活)`);


    // --- 测试用例 3: Fetch 网络错误 ---
    console.log("\n--- Dify集成 - 用例3: 网络错误 ---");
    setupMocks();
    window.fetch = () => Promise.reject(new Error("网络连接失败"));
    await window.sendMessageToDify("用户测试消息3");
    
    assert(addMessageCalls.length === 2, "网络错误: addMessageToChat 调用次数应为2 (用户消息 + 错误消息)", addMessageCalls);
    if(addMessageCalls.length === 2) {
        assert(addMessageCalls[0].msg === "用户测试消息3" && addMessageCalls[0].sender === "user", "网络错误: 用户消息应已显示");
        assert(addMessageCalls[1].msg.includes("网络错误"), "网络错误: 应显示网络错误消息");
    }
    assert(playSpeechCalls.length === 0, "网络错误: playTextAsSpeech 不应被调用", playSpeechCalls);
    assert(animationCalls.includes(listeningAnimName), `网络错误: 开始时应切换到 ${listeningAnimName} 动画`);
    assert(animationCalls.some(call => call === defaultAnimName && animationCalls.indexOf(call) > animationCalls.indexOf(listeningAnimName)), 
           `网络错误: 结束后应切换到 ${defaultAnimName} 动画 (假设STT未激活)`);

    // 恢复原始函数和状态 (Restore original functions and state)
    window.fetch = originalFetch;
    window.addMessageToChat = originalAddMessageToChat;
    window.playTextAsSpeech = originalPlayTextAsSpeech;
    window.switchToAnimation = originalSwitchToAnimation;
    window.isRecordingPublic = originalIsRecording; // 恢复 isRecording 状态
    console.log("\n--- Dify集成测试完成，原始函数已恢复 ---");
}

// 注意:
// 1. 确保在 index.html 中，所有被测试的函数 (floatTo16BitPCM, sendMessageToDify, 等) 和
//    变量 (LISTENING_ANIMATION_NAME, DEFAULT_ANIMATION_NAME, isRecording) 都已正确附加到 window 对象上。
// 2. `sendMessageToDify` 现在是直接从 `window.sendMessageToDify` 调用的，
//    这要求它在主脚本中被定义为一个独立的、可全局调用的函数，而不是仅仅作为事件监听器的匿名函数。
// 3. 对动画切换的断言 (`animationCalls.some(...)`) 检查默认动画是否在聆听动画之后被调用。
//    这假设了 `sendMessageToDify` 中当 `isRecording` 为 false 时的同步或可预测的异步流程。
//    如果 `playTextAsSpeech` 的完成是切换回默认动画的唯一触发器，那么这些断言可能需要调整，
//    因为 `playTextAsSpeech` 被模拟为立即解析。更复杂的异步流程可能需要更复杂的测试设置。
// 4. `isRecordingPublic` 用于在测试期间控制和检查 `isRecording` 的状态。
```
