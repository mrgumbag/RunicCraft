import { useState } from 'react';
import './LootProbabilityCalculator.css'; // CSS 파일 임포트

export default function LootProbabilityCalculator() {
    const [difficulty, setDifficulty] = useState('normal'); // 'normal', 'twilight', 'doomsday'

    const [targetItemProb, setTargetItemProb] = useState(0.01); // 기본값 1%
    const [avgTimePerBox, setAvgTimePerBox] = useState(0); // 상자 획득 시간 (초)
    const [result, setResult] = useState('');

    const difficulties = [
        { id: 'normal', name: '보통' },
        { id: 'twilight', name: '황혼' },
        { id: 'doomsday', name: '종말' },
    ];

    // 난이도별 드랍률 설정 (예시 값)
    const dropRates = {
        normal: { numItems: 2 },
        twilight: { numItems: { 2: 0.5, 3: 0.5 } }, // 50% 확률로 2개, 50% 확률로 3개
        doomsday: { numItems: 3 },
    };

    const calculateProbability = () => {
        const selectedRates = dropRates[difficulty as keyof typeof dropRates];
        if (!selectedRates) {
            setResult('유효하지 않은 난이도입니다.');
            return;
        }

        const p = targetItemProb; // 단일 슬롯에서 목표 아이템이 나올 확률

        let probAtLeast1 = 0;
        let probAtLeast2 = 0;
        let probAtLeast3 = 0; // 3개 이상 획득 확률 변수 추가

        // 조합 C(n, k) 계산을 위한 헬퍼 함수
        const combinations = (n: number, k: number): number => {
            if (k < 0 || k > n) return 0;
            if (k === 0 || k === n) return 1;
            // if (k > n / 2) k = n - k; // Removed optimization
            let res = 1;
            for (let i = 1; i <= k; ++i) {
                res = res * (n - i + 1) / i;
            }
            return res;
        };

        // 이항 확률 P(X=k) 계산을 위한 헬퍼 함수
        const binomialProb = (n: number, k: number, p: number): number => {
            return combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
        };

        if (typeof selectedRates.numItems === 'object' && selectedRates.numItems !== null) {
            // 황혼 난이도
            const prob2Items = selectedRates.numItems[2];
            const prob3Items = selectedRates.numItems[3];

            // 아이템 2개일 때의 확률
            const p_atLeast1_2 = 1 - Math.pow(1 - p, 2);
            const p_atLeast2_2 = binomialProb(2, 2, p);
            const p_atLeast3_2 = 0; // 2개 드랍에서는 3개 이상이 나올 수 없음

            // 아이템 3개일 때의 확률
            const p_atLeast1_3 = 1 - Math.pow(1 - p, 3);
            const p_atLeast2_3 = 1 - binomialProb(3, 0, p) - binomialProb(3, 1, p);
            const p_atLeast3_3 = binomialProb(3, 3, p); // P(X=3)

            // 가중 평균 계산
            probAtLeast1 = prob2Items * p_atLeast1_2 + prob3Items * p_atLeast1_3;
            probAtLeast2 = prob2Items * p_atLeast2_2 + prob3Items * p_atLeast2_3;
            probAtLeast3 = prob2Items * p_atLeast3_2 + prob3Items * p_atLeast3_3;

        } else {
            // 보통 및 종말 난이도
            const n = selectedRates.numItems;

            probAtLeast1 = 1 - Math.pow(1 - p, n);
            probAtLeast2 = 1 - binomialProb(n, 0, p) - binomialProb(n, 1, p);

            // 종말 난이도(n=3)만 해당
            if (n === 3) {
                probAtLeast3 = binomialProb(n, 3, p);
            }
            // 보통 난이도(n=2)는 3개 이상 획득 확률이 0이므로 따로 계산하지 않음
        }

        // 최소 1개 획득까지 필요한 상자 개수 기댓값 (올림 처리)
        const expectedBoxesToOpen = probAtLeast1 > 0 ? Math.ceil(1 / probAtLeast1) : Infinity;

        // 최종 결과를 담을 HTML 문자열
        let resultHTML = `
      <p>최소 1개 이상 획득 확률: ${(probAtLeast1 * 100).toFixed(10)}%</p>
      <p>최소 2개 이상 획득 확률: ${(probAtLeast2 * 100).toFixed(10)}%</p>
      <p>최소 3개 이상 획득 확률: ${(probAtLeast3 * 100).toFixed(10)}%</p>
      <p>1개 획득 기댓값 (상자 개수): ${expectedBoxesToOpen}회</p>
    `;

        // 평균 상자 획득 시간이 입력되었을 때만 예상 시간 계산하여 추가
        if (avgTimePerBox > 0 && expectedBoxesToOpen !== Infinity) {
            const expectedTimeInMinutes = (expectedBoxesToOpen * Number(avgTimePerBox)) / 60;
            const hours = Math.floor(expectedTimeInMinutes / 60);
            const minutes = Math.round(expectedTimeInMinutes % 60);
            const formattedTime = `${hours}시간 ${minutes}분`;
            resultHTML += `<p><b>1개 획득 예상 시간: ${formattedTime}</b></p>`;
        }

        setResult(resultHTML);
    };

    return (
        <div>
            <h3>전리품 확률 계산기</h3>
            <div>
                <p>난이도 선택:</p>
                <div className="difficulty-selection">
                    {difficulties.map((d) => (
                        <button
                            key={d.id}
                            className={difficulty === d.id ? 'active' : ''}
                            onClick={() => setDifficulty(d.id)}
                        >
                            {d.name}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="targetItemProb">계산할 전리품 등장 확률 (%):</label>
                <input
                    type="number"
                    id="targetItemProb"
                    value={(targetItemProb * 100).toString()} // 퍼센트로 표시
                    onChange={(e) => setTargetItemProb(Number(e.target.value) / 100)} // 소수점으로 저장
                    min="0"
                    max="100"
                    step="0.01"
                />
            </div>

            <div>
                <label htmlFor="avgTimePerBox">평균 상자 획득 시간 (초):</label>
                <input
                    type="number"
                    id="avgTimePerBox"
                    value={avgTimePerBox.toString()} 
                    onChange={(e) => setAvgTimePerBox(Number(e.target.value))}
                    min="0"
                />
            </div>

            <button onClick={calculateProbability}>확률 계산</button>
            {result && <div dangerouslySetInnerHTML={{ __html: result }} />}
        </div>
    );
}