import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVenues, createVenue, updateVenueById, deleteVenueById } from '../../store/sportsMeetSlice';

const { Option } = Select;
const { Search } = Input;

const VenueManagement = () => {
  // console.log('VenueManagement component rendered');
  const dispatch = useDispatch();
  const { venues, loading } = useSelector(state => state.sportsMeet);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    // 从API获取场馆数据
    dispatch(fetchVenues());
  }, [dispatch]);

  // 监听Modal状态变化
  useEffect(() => {
    // console.log('Modal状态变化:', { isModalVisible, isEditMode, editingId });
  }, [isModalVisible, isEditMode, editingId]);

  // 使用useMemo计算过滤后的场地列表
  const filteredVenues = useMemo(() => {
    if (!venues) return [];
    return venues.filter(venue => 
      venue.name.toLowerCase().includes(searchText.toLowerCase()) ||
      String(venue.id).toLowerCase().includes(searchText.toLowerCase())
    );
  }, [venues, searchText]);

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
      // 将capacity转换为数字
      const processedValues = {
        ...values,
        capacity: Number(values.capacity)
      };
      
      if (isEditMode) {
        // 编辑模式：使用保存的ID
        await dispatch(updateVenueById({ venueId: editingId, venueData: processedValues })).unwrap();
        message.success('场地信息更新成功');
      } else {
        // 添加模式：使用真实API创建
        await dispatch(createVenue(processedValues)).unwrap();
        message.success('场地信息添加成功');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingId(null);
    } catch (error) {
      // console.error('操作失败:', error);
      message.error(error || '操作失败，请检查输入');
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
      content: '确定要删除该场地信息吗？',
      onOk: async () => {
        try {
          await dispatch(deleteVenueById(id)).unwrap();
          message.success('场地信息删除成功');
        } catch (error) {
          message.error(error || '删除失败，请重试');
        }
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
      title: '场地ID',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '场地名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '场地类型',
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (text) => `${text} 人/队`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: status => status === 'available' ? '可用' : '不可用'
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location'
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
      <h2>场地管理</h2>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Search
          placeholder="搜索场地名称或ID"
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
          添加场地
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={filteredVenues}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={isEditMode ? '编辑场地' : '添加场地'}
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
              label="场地ID"
            >
              <Input disabled placeholder="系统自动生成" />
            </Form.Item>
          )}
          <Form.Item
            name="name"
            label="场地名称"
            rules={[{ required: true, message: '请输入场地名称' }]}
          >
            <Input placeholder="请输入场地名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="场地类型"
            rules={[{ required: true, message: '请选择场地类型' }]}
          >
            <Select placeholder="请选择场地类型">
              <Option value="track">田径场</Option>
              <Option value="field">足球场</Option>
              <Option value="gym">体育馆</Option>
              <Option value="swimming_pool">游泳池</Option>
              <Option value="basketball_court">篮球场</Option>
              <Option value="volleyball_court">排球场</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="capacity"
            label="容量"
            rules={[
              { required: true, message: '请输入容量' },
              {
                validator: (_, value) => {
                  // 确保值不为空且是有效的数字
                  if (value && value.trim() !== '') {
                    const numValue = Number(value);
                    if (isNaN(numValue) || numValue < 1) {
                      return Promise.reject(new Error('容量必须是大于0的数字'));
                    }
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input type="number" placeholder="请输入容量" />
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
          <Form.Item
            name="location"
            label="位置"
            rules={[{ required: true, message: '请输入位置' }]}
          >
            <Input placeholder="请输入位置" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VenueManagement;