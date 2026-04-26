const fs = require('fs');
const path = require('path');

const TEST_CASES_DIR = path.join(__dirname, '../../docs/test_cases');

/**
 * 테스트 케이스 파일을 파싱하여 원문과 기대 결과를 추출합니다.
 */
function parseTestCase(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    const rawMatch = content.match(/\[원문\]\n([\s\S]*?)\n\n\[기대 결과\]/);
    const expectedMatch = content.match(/\[기대 결과\]\n([\s\S]*?)\n\n\[주요 교정 포인트\]/);
    
    if (!rawMatch || !expectedMatch) {
        throw new Error(`Failed to parse test case: ${filePath}`);
    }
    
    return {
        raw: rawMatch[1].trim(),
        expected: expectedMatch[1].trim()
    };
}

/**
 * (MOCK) 실제로는 Gemini API 또는 파이프라인 함수를 호출해야 합니다.
 * 여기서는 구조만 잡기 위해 임시 함수로 둡니다.
 */
async function runUrimalPipeline(rawText) {
    console.log('Running AI Pipeline...');
    // TODO: 여기에 실제 Gemini 윤문 API 호출 로직 연결
    // 임시로 원본 반환 (테스트 실패 유도)
    return rawText; 
}

async function main() {
    console.log('--- urimal 파이프라인 무결성 검증 시작 ---');
    
    if (!fs.existsSync(TEST_CASES_DIR)) {
        console.error(`테스트 케이스 폴더를 찾을 수 없습니다: ${TEST_CASES_DIR}`);
        return;
    }
    
    const files = fs.readdirSync(TEST_CASES_DIR).filter(file => file.endsWith('.txt'));
    let passed = 0;
    let failed = 0;
    
    for (const file of files) {
        const filePath = path.join(TEST_CASES_DIR, file);
        console.log(`\n[테스트 중] ${file}`);
        
        try {
            const { raw, expected } = parseTestCase(filePath);
            const result = await runUrimalPipeline(raw);
            
            // 공백 제거 등 유연한 비교 로직 필요 (여기서는 단순 비교)
            if (result === expected) {
                console.log(`✅ 통과: ${file}`);
                passed++;
            } else {
                console.error(`❌ 실패: ${file}`);
                console.error(`  - 기대 결과: ${expected}`);
                console.error(`  - 실제 결과: ${result}`);
                failed++;
            }
        } catch (e) {
            console.error(`❌ 에러 발생 (${file}): ${e.message}`);
            failed++;
        }
    }
    
    console.log('\n--- 검증 완료 ---');
    console.log(`전체: ${passed + failed}, 통과: ${passed}, 실패: ${failed}`);
    
    if (failed > 0) {
        process.exit(1);
    }
}

main();
