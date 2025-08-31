import { useState } from 'react';
import './CalculatorPage.css'; // Import the new CSS file

import LootProbabilityCalculator from '../components/LootProbabilityCalculator'; // Import the new component
import DungeonEfficiencyCalculator from '../components/DungeonEfficiencyCalculator'; // Import the new component

// Placeholder components for different calculators
const CalculatorType3 = () => <div><h3>계산기 3</h3><p>계산기 3의 내용입니다.</p></div>;

export default function CalculatorPage() {
  const [selectedCalculator, setSelectedCalculator] = useState('type1'); // Default to Calculator Type 1

  const calculators = [
    { id: 'type1', name: '전리품 확률 계산기', component: <LootProbabilityCalculator /> },
    { id: 'dungeonEfficiency', name: '던전 레벨 / 클래스 효율 계산기', component: <DungeonEfficiencyCalculator /> },
    { id: 'type3', name: '계산기 3', component: <CalculatorType3 /> },
  ];

  const renderCalculator = () => {
    const calculator = calculators.find(calc => calc.id === selectedCalculator);
    return calculator ? calculator.component : <p>계산기를 선택해주세요.</p>;
  };

  return (
    <div className="calculator-page-container">
      <div className="calculator-sidebar">
        <h3>계산기 선택</h3>
        <ul>
          {calculators.map((calc) => (
            <li key={calc.id}>
              <button
                className={selectedCalculator === calc.id ? 'active' : ''}
                onClick={() => setSelectedCalculator(calc.id)}
              >
                {calc.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="calculator-main-content">
        {renderCalculator()}
      </div>
    </div>
  );
}
