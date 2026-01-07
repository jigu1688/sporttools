import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const TestComponent = () => {
  console.log('TestComponent rendered successfully');
  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>测试组件</Title>
      <p>这个测试组件可以正常访问！</p>
    </div>
  );
};

export default TestComponent;