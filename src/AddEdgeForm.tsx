import React, { useEffect } from "react";
import { Button, Form, Input, InputNumber } from "antd";

const AddEdgeForm: React.FC<{
	getFormValues: (values: Record<string, unknown>) => void;
	initData: Record<string, unknown>;
	nodeDatas: Record<string, Record<string, unknown>>;
}> = ({ getFormValues, initData, nodeDatas }) => {
	const [form] = Form.useForm();


	console.log("Form");
	

	useEffect(() => {
		form.setFieldsValue({
			...initData,
		});
	}, [initData]);

	return (
		<Form
			form={form}
			name="basic"
			labelCol={{ span: 6 }}
			wrapperCol={{ span: 14 }}
			style={{ maxWidth: 600 }}
			onFinish={getFormValues}
			autoComplete="off"
		>
			<Form.Item
				label="SrcHopID"
				name="SrcHopID"
				rules={[{ required: true, message: "Please input your SrcHopID!" }]}
			>
				<InputNumber disabled controls={false} style={{ width: '100%' }}  />
			</Form.Item>
			<Form.Item
				label="DstHopID"
				name="DstHopID"
				rules={[{ required: true, message: "Please input your DstHopID!" }]}
			>
				<InputNumber disabled controls={false} style={{ width: '100%' }}  />
			</Form.Item>

			<Form.Item
				label="Jitter"
				name={["Status", "Jitter"]}
				rules={[{ required: true, message: "Please input your Jitter!" }]}
			>
				<InputNumber controls={false} style={{ width: '100%' }}  />
			</Form.Item>
			<Form.Item
				label="RTT"
				name={["Status", "RTT"]}
				rules={[{ required: true, message: "Please input your RTT!" }]}
			>
				<InputNumber controls={false} style={{ width: '100%' }}  />
			</Form.Item>
			<Form.Item
				label="Lossrate"
				name={["Status", "Lossrate"]}
				rules={[{ required: true, message: "Please input your Lossrate!" }]}
			>
				<InputNumber controls={false} style={{ width: '100%' }}  />
			</Form.Item>

			<Form.Item wrapperCol={{ offset: 18, span: 6 }}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	);
};
export default AddEdgeForm;
