// @flow
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Evaluation.scss';

function Evaluation() {
  const [testSet, setTestSet] = useState('testSet1');

  const testSets = {
    testSet1: {
      name: 'testSet1',
      team_id: '8d1fbcfe-aae9-4f05-971e-da144b72f699',
      test_words: [
        ['food'],
        ['architecture'],
        ['landscape', 'mountain'],
        ['girl'],
        ['person', 'girl'],
        ['plants'],
        ['flower'],
        ['art'],
        ['art', 'photography'],
        ['person'],
        ['nature', 'water'],
      ],
    },
    testSet2: {
      name: 'testSet2',
      team_id: 'ba2340a3-e798-4956-baf2-4ba6c76a074f',
      test_words: [
        ['one', 'key'],
        ['another', 'hey'],
      ],
    },
  };

  return (
    <div className="Evaluation">
      <div className="Evaluation__title">
        Evaluation
      </div>
      <select
        className="Evaluation__select"
        value={testSet}
        onChange={e => setTestSet(e.target.value)}
      >
        <option value="testSet1">Test Set 1</option>
        <option value="testSet2">Test Set 2</option>
      </select>
      <div className="Evaluation__buttonbar">
        <Link
          to={{
            pathname: '/evaluation/search_terms',
            state: {
              testSet: testSets[testSet],
            },
          }}
          className="Evaluation__buttonbar__button"
          style={{ marginRight: 20 }}
        >
          Search Terms
        </Link>
        <Link
          to={{
            pathname: '/evaluation/ranking',
            state: {
              testSet: testSets[testSet],
            },
          }}
          className="Evaluation__buttonbar__button"
        >
          Ranking
        </Link>
      </div>
    </div>
  );
}

export default Evaluation;
