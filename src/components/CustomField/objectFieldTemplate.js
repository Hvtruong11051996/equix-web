export function ObjectFieldTemplate(obj) {
    const { TitleField, properties, title, description, uiSchema } = obj;
    const firstKey = Object.keys(uiSchema)[0];
    const editable = !(uiSchema && uiSchema[firstKey] && uiSchema[firstKey]['ui:readonly'])
    return properties.map((element, key) => {
        const FieldSchema = element && element.content;
        const name = element && element.name;
        const classNames = (uiSchema && uiSchema[name] && uiSchema[name].classNames) || ''
        let error = element && element.content && element.content.props && element.content.props.errorSchema && element.content.props.errorSchema.__errors && element.content.props.errorSchema.__errors[0];
        let value = '';
        // if (!editable && element && element.content && element.content.props && element.content.props.formData && element.content.props.uiSchema) {
        //     if (element.content.props.formData.value && element.content.props.formData.listValue) {
        //         const valObj = element.content.props.formData.listValue;
        //         const val = element.content.props.formData.value;
        //         for (const key in valObj) {
        //             const element = valObj[key];
        //             if (val === element.value) {
        //                 value = element.label || '';
        //             }
        //         }
        //     } else {
        //         value = element.content.props.formData;
        //     }
        // }
        return (
            <div key={key} className={classNames} title={value || ''}>
                {FieldSchema}
                {
                    error && editable ? <div className='rowError'>
                        {error}
                    </div> : null
                }
            </div>
        )
    })
}
