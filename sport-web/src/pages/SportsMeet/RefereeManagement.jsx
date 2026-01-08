import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { setReferees, addReferee, updateReferee, deleteReferee } from '../../store/sportsMeetSlice';

const { Option } = Select;
const { Search } = Input;

const RefereeManagement = () => {
  // console.log('RefereeManagement component rendered');
  const dispatch = useDispatch();
  const { referees, loading } = useSelector(state => state.sportsMeet);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // 模拟数据，后续将从API获取
    const mockReferees = [
      { id: 'R001', name: '张三', gender: 'male', phone: '13800138001', specialty: '田径', status: 'available' },
      { id: 'R002', name: '李四', gender: 'female', phone: '13800138002', specialty: '篮球', status: 'available' },
      { id: 'R003', name: '王五', gender: 'male', phone: '13800138003', specialty: '游泳', status: 'unavailable' }
    ];
    dispatch(setReferees(mockReferees));
  }, [dispatch]);

  // 监听Modal状态变化
  useEffect(() => {
    // console.log('Modal状态变化:', { isModalVisible, isEditMode, editingId });
  }, [isModalVisible, isEditMode, editingId]);

  // 使用useMemo计算过滤后的裁判列表
  const filteredReferees = useMemo(() => {
    if (!referees) return [];
    return referees.filter(referee => 
      referee.name.toLowerCase().includes(searchText.toLowerCase()) ||
      referee.id.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [referees, searchText]);

  const showModal = (editMode = false, record = null) => {
    // console.log('showModal called', { editMode, record, isModalVisible });
    // 先设置编辑模式和ID
    setIsEditMode(editMode);
    if (editMode && record) {
      setEditingId(record.id);
      form.setFieldsValue(record);
    } else {
      setEditingId(null);
      form.resetFields();
    }
    // 然后显示模态框
    setIsModalVisible(true);
    
    // console.log('Modal should be visible now');
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEditMode) {
        // 编辑模式：使用保存的ID
        dispatch(updateReferee({ ...values, id: editingId }));
        message.success('裁判员信息更新成功');
      } else {
        // 添加模式：生成新ID
        const newId = 'R' + String(Date.now()).slice(-6);
        dispatch(addReferee({ ...values, id: newId }));
        message.success('裁判员信息添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      // console.error('表单验证失败:', error);
      message.error('表单验证失败，请检查输入');
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该裁判员信息吗？',
      onOk() {
        dispatch(deleteReferee(id));
        message.success('裁判员信息删除成功');
      }
    });
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'serialNumber',
      key: 'serialNumber',
      render: (text, record, index) => index + 1
    },
    {
      title: '裁判员ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: gender => gender === 'male' ? '男' : '女'
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: '擅长项目',
      dataIndex: 'specialty',
      key: 'specialty'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => status === 'available' ? '可用' : '不可用'
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            style={{ marginRight: 8 }}
            onClick={() => {
              // console.log('编辑按钮被点击', record);
              showModal(true, record);
            }}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>裁判员管理</h2>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Search
          placeholder="搜索裁判员姓名或ID"
          allowClear
          enterButton={<SearchOutlined />}
          size="middle"
          onSearch={value => setSearchText(value)}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            // console.log('添加按钮被点击');
            showModal(false);
          }}
        >
          添加裁判员
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredReferees}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={isEditMode ? '编辑裁判员' : '添加裁判员'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          {isEditMode && (
            <Form.Item
              name="id"
              label="裁判员ID"
            >
              <Input disabled placeholder="系统自动生成" />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Select placeholder="请选择性别">
              <Option value="male">男</Option>
              <Option value="female">女</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item
            name="specialty"
            label="擅长项目"
            rules={[{ required: true, message: '请输入擅长项目' }]}
          >
            <Input placeholder="请输入擅长项目" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="available">可用</Option>
              <Option value="unavailable">不可用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RefereeManagement;