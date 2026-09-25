ปรับปรุงและออกแบบเว็บไซต์ **Vehicle Management System / ระบบจัดการยานพาหนะ** ใหม่ทั้งหมด โดยอ้างอิงจากโครงสร้างข้อมูลจริงที่กำหนดไว้ด้านล่าง ห้ามตัด field สำคัญออก และต้องทำให้ข้อมูลระหว่าง Vehicle, Repair, Repair Items, Documents และ Maintenance Plan เชื่อมโยงกันอย่างถูกต้อง

เป้าหมายคือให้ระบบดู **ทันสมัย สวย สะอาด ใช้งานง่าย และเป็นระบบบริหารจัดการแบบ Enterprise** โดยเน้นการแสดงข้อมูลที่จำเป็น ไม่ทำ UI ให้รกหรือซับซ้อนเกินไป

Primary Color: **#1565c0**

---

# 1. Vehicle Management

ปรับหน้า Vehicle ให้เป็นศูนย์กลางข้อมูลของรถแต่ละคัน

## Vehicle Information

รองรับข้อมูล:

* License Plate

  * plateProvince
* chassisNumber
* engineNumber
* vehicleTypeId
* brandId
* modelId
* yearManufactured
* colorId
* plateTypeId
* fuelType
* transmissionType
* seatCapacity
* enginePower
* ownerLocationId
* currentLocationId
* ownershipType
* usageType
* assignedUser
* registeredName
* isBookable
* purchaseDate
* purchasePrice
* purchaseUsdRate
* purchaseCurrencyId
* initialMileage
* createdBy

รองรับการเพิ่มและแสดง **รูปภาพรถหลายรูป** เช่น รูปรถด้านหน้า ด้านหลัง ด้านข้าง ภายใน และรูปอื่น ๆ

## Vehicle List

แสดงข้อมูลสำคัญในรูปแบบ Table/Card ที่อ่านง่าย และรองรับ:

* Search
* Filter
* Sort
* Pagination
* Edit
* Delete
* View Detail

สามารถ Filter ตาม:

* License Plate
* Vehicle Type
* Brand
* Model
* Location
* Usage Type
* Ownership Type
* Assigned User
* Status

## Vehicle Detail

เมื่อกดเข้ารถแต่ละคัน ให้แสดงข้อมูลแบบ Detail Page พร้อม Tabs เช่น:

* Overview
* Repairs
* Maintenance Plans
* Documents
* Expenses
* Images
* History

โดยทุกข้อมูลต้องเชื่อมกับ Vehicle คันนั้นโดยตรง

---

# 2. Repair Management

ปรับหน้า Repair ใหม่ โดย **ไม่ต้องแสดงรถเป็น Card จำนวนมากเหมือนหน้า Vehicle**

ให้หน้า Repair เน้นที่ **รายการงานซ่อม** เป็นหลัก

## Repair List

แสดง:

* Repair Title
* License Plate
* Vehicle
* Location
* Maintenance Date
* Mileage
* Garage / Vendor
* Repair Category
* Item Count
* Total Cost
* Payment Status
* Next Due Date
* Next Due Mileage
* Repair Status

รองรับ Filter:

* Vehicle
* License Plate
* Location
* Garage
* Category
* Date Range
* Repair Status
* Payment Status

และรองรับ:

* Search
* Sort
* Pagination
* Edit
* Delete
* View Detail

---

# 3. Repair Data

Repair ต้องรองรับข้อมูล:

* id
* vehicleId
* licensePlate
* plateProvince
* plateTextColor
* plateBackgroundColor
* vehicleLocationId
* vehicleCurrentMileage
* title
* categoryId
* categoryName
* partTypes
* vendorName
* vendorContact
* garageId
* garageBranchId
* garageAddress
* maintenanceDate
* mileageAtService
* description
* cost
* currencyId
* currencyCode
* usdRate
* usdCost
* invoiceNumber
* nextDueMileage
* nextDueDate
* dueInDays
* dueInKm
* nextDueThresholdDays
* nextDueThresholdKm
* itemsTotal
* itemCount
* alertItemCount
* activeAlertCount
* createdBy
* createdAt

รองรับ Image / Attachment สำหรับงานซ่อม เช่น:

* รูปก่อนซ่อม
* รูประหว่างซ่อม
* รูปหลังซ่อม
* ใบเสร็จ
* Invoice
* เอกสารอื่น ๆ

---

# 4. Repair Items / รายการอะไหล่ย่อย

Repair 1 รายการสามารถมี **หลาย Repair Items**

ตัวอย่าง:

Repair:

> เปลี่ยนระบบเบรก

Items:

* Brake Pad
* Brake Disc
* Brake Fluid
* Labor

แต่ละ Item รองรับ:

* itemName
* description
* quantity
* unitPrice
* totalPrice
* currencyId
* categoryId
* alertEnabled
* intervalKm
* intervalDays
* nextDueDate
* nextDueMileage
* alertThresholdDays
* alertThresholdKm

## UI

ในหน้า Add/Edit Repair ให้มีส่วน **Repair Items** เป็นตารางลักษณะคล้าย Invoice

สามารถ:

* Add Item
* Edit Item
* Delete Item
* Duplicate Item
* กำหนดจำนวน
* กำหนดราคาต่อหน่วย
* คำนวณ Total อัตโนมัติ
* กำหนดรอบการแจ้งเตือน
* กำหนด Next Due Date / Mileage

ด้านล่างตารางให้แสดง:

* จำนวนรายการ
* Items Total
* Repair Total Cost

---

# 5. Repair Detail

เมื่อเปิด Repair Detail ต้องเห็นข้อมูลครบในหน้าเดียวอย่างเป็นระเบียบ

แบ่งเป็น:

### Repair Information

ข้อมูลการซ่อมและรถ

### Garage / Vendor

ข้อมูลอู่หรือผู้ให้บริการ

### Repair Items

แสดงรายการอะไหล่ทั้งหมดของ Repair

### Cost

ค่าใช้จ่าย สกุลเงิน และ USD Rate

### Reminder

Next Due Date / Mileage และ Alert Threshold

### Attachments

รูปภาพและเอกสาร

### History

ประวัติการแก้ไขข้อมูล

---

# 6. Document Management

Document ต้องผูกกับ Vehicle ทุกครั้ง

เมื่อกด Add Document ให้เลือก **Vehicle ก่อน** จากนั้นจึงกรอกข้อมูล Document

รองรับข้อมูล:

* id
* vehicleId
* licensePlate
* vehicleLocationId
* documentTypeId
* documentTypeCode
* documentTypeName
* country
* issuerName
* subtypeName
* documentNumber
* startDate
* endDate
* amount
* currencyId
* currencyCode
* coverageAmount
* deductible
* status
* effectiveStatus
* daysRemaining
* usdRate
* usdAmount
* alertEnabled
* alertThresholdDays
* cancelReason
* note
* createdBy
* createdAt

รองรับ Document Type เช่น:

* Road Fee
* Insurance
* Technical Inspection
* Vehicle Registration Book
* Lease / Purchase Contract
* Vehicle Border Pass

---

# 7. Document List

แสดงเอกสารเป็นรายการหลัก ไม่ต้องแสดง Vehicle ซ้ำมากเกินไป

แสดง:

* Document Type
* License Plate
* Vehicle
* Location
* Document Number
* Country
* Start Date
* End Date
* Days Remaining
* Amount
* Status

รองรับ Filter:

* Vehicle
* License Plate
* Location
* Document Type
* Country
* Status
* Expiring Soon
* Expired
* Date Range

รองรับ:

* Search
* Sort
* Edit
* Delete
* View
* Renew

---

# 8. Document Renewal / ประวัติการต่ออายุ

เมื่อกด **Renew Document** ห้ามเขียนทับข้อมูลเดิม

ให้สร้างข้อมูล Version ใหม่ และเก็บข้อมูลเดิมไว้เป็น History

ตัวอย่าง:

Document #1
→ ต่ออายุ
→ Document #2
→ ต่ออายุ
→ Document #3

ต้องสามารถเปิดดูประวัติทั้งหมดได้ว่า:

* เอกสารเดิมคืออะไร
* ต่ออายุเมื่อใด
* วันหมดอายุเดิม
* วันหมดอายุใหม่
* จำนวนเงิน
* ผู้ดำเนินการ
* วันที่แก้ไข
* ไฟล์หรือรูปภาพของแต่ละ Version

ดังนั้น Document Detail ควรมีส่วน **Renewal History / Document History**

---

# 9. Maintenance Plan

Maintenance Plan ใช้สำหรับวางแผนงานซ่อมในอนาคต เช่น:

* เปลี่ยนน้ำมันเครื่อง
* เปลี่ยนยาง
* เปลี่ยน Brake Pad
* ตรวจเช็กระบบ
* งานบำรุงรักษาตามระยะ

หนึ่ง Plan สามารถมี **หลายรายการย่อย**

แต่ละรายการสามารถระบุ:

* Item Name
* Description
* Category
* Planned Date
* Planned Mileage
* Parts / Spare Parts
* Estimated Cost
* Status
* Note

รองรับสถานะ:

* Planned
* Upcoming
* In Progress
* Partially Completed
* Completed
* Cancelled
* Overdue

---

# 10. Create Repair from Maintenance Plan

นี่เป็น Workflow สำคัญ

เมื่อกด **Create Repair** จาก Maintenance Plan:

1. แสดงข้อมูล Vehicle และ Plan
2. แสดงรายการย่อยทั้งหมดใน Plan
3. ให้ User เลือกเฉพาะรายการที่ต้องการซ่อมในครั้งนี้
4. รายการที่เลือกจะถูกนำไปสร้างเป็น Repair Items
5. รายการที่ไม่ได้เลือกยังคงอยู่ใน Maintenance Plan
6. เมื่อทำบางรายการเสร็จ ให้ Plan เป็น **Partially Completed**
7. สามารถสร้าง Repair ครั้งถัดไปจากรายการที่ยังไม่เสร็จ
8. เมื่อรายการทั้งหมดเสร็จแล้วจึงเปลี่ยน Plan เป็น **Completed**

ตัวอย่าง:

Maintenance Plan มี 5 Items

* เปลี่ยนน้ำมันเครื่อง ✓
* เปลี่ยนกรองอากาศ ✓
* เปลี่ยน Brake Pad
* เปลี่ยนยาง
* ตรวจระบบช่วงล่าง

ครั้งแรกเลือกทำ 2 รายการแรก

ผลลัพธ์:

**Repair #1**

* น้ำมันเครื่อง
* กรองอากาศ

**Maintenance Plan**

* Status = Partially Completed
* เหลือ 3 Items

ครั้งถัดไปสามารถสร้าง Repair จาก 3 Items ที่เหลือได้

---

# 11. Parts / Spare Parts

ใน Maintenance Plan สามารถระบุ Parts ที่ต้องใช้หรือจำเป็นต้องจัดซื้อได้

Workflow:

**Maintenance Plan → Parts → Repair**

Parts ที่วางแผนไว้ยังไม่จำเป็นต้องถือว่าใช้แล้ว

เมื่อสร้าง Repair จึงเลือกได้ว่า Part ใดถูกใช้จริง

ระบบควรแยกให้ชัดเจนระหว่าง:

* Planned Part
* Ordered Part
* Received Part
* Used Part

เพื่อป้องกันข้อมูลค่าใช้จ่ายและจำนวนอะไหล่ผิดพลาด

---

# 12. Alert / Notification

ระบบต้องคำนวณและแจ้งเตือน:

### Document

* ใกล้หมดอายุ
* หมดอายุแล้ว

### Repair

* ถึงกำหนดซ่อมตาม Date
* ถึงกำหนดตาม Mileage

### Repair Item

* ถึงรอบเปลี่ยน
* ใกล้ถึงรอบเปลี่ยน

รองรับ Alert Threshold เช่น:

* แจ้งเตือนก่อน 7 วัน
* แจ้งเตือนก่อน 30 วัน
* แจ้งเตือนก่อน 1,000 km

สามารถกำหนดได้ทั้งระดับ Repair และ Repair Item

---

# 13. UI / UX Redesign

ออกแบบ Website ใหม่ให้ดู:

* Modern
* Clean
* Professional
* Enterprise
* ใช้งานง่าย
* Responsive
* ข้อมูลไม่รก

ใช้ Table สำหรับข้อมูลจำนวนมาก และใช้ Detail Page / Drawer / Modal สำหรับข้อมูลรายละเอียด

เน้น:

* Typography ที่อ่านง่าย
* Spacing ที่เป็นระเบียบ
* Status Badge
* Summary Cards
* Tabs
* Filters
* Search
* Clear Action Buttons
* Image Preview
* Attachment Preview

ไม่ใช้ Gradient หรือ Effect มากเกินไปจนทำให้ระบบดูเหมือน Landing Page

---

# 14. Common Actions

ทุก Entity ต้องรองรับ Action ที่จำเป็น:

* View
* Add
* Edit
* Delete
* Update
* Upload Image
* Upload Attachment

ก่อน Delete ให้มี Confirmation

ทุกข้อมูลที่มีรูปภาพต้องสามารถ:

* Upload
* Preview
* Delete
* View ได้

---

# 15. Data Relationship

โครงสร้างความสัมพันธ์หลักต้องเป็น:

**Vehicle**
→ Documents
→ Repairs
→ Repair Items
→ Maintenance Plans
→ Maintenance Plan Items
→ Parts

และ:

**Maintenance Plan**
→ เลือก Items
→ Create Repair
→ Repair Items
→ Update สถานะกลับไปยัง Maintenance Plan

ข้อมูลที่แสดงในทุกหน้าต้องอ้างอิงจากข้อมูลจริงของ Entity เดียวกัน ไม่สร้างข้อมูลซ้ำที่ไม่จำเป็น

---

## เป้าหมายสุดท้าย

ปรับปรุงระบบเดิมให้เป็น **Vehicle Management System ที่พร้อมใช้งานจริงในระดับองค์กร** โดยเน้น 3 เรื่อง:

1. **ข้อมูลครบตาม Data Model**
2. **Workflow ของ Repair / Maintenance / Document เชื่อมโยงกันจริง**
3. **UI สวย ทันสมัย ใช้งานง่าย และไม่ซับซ้อนเกินไป**

อย่าเพิ่มข้อมูลหรือ Feature ที่ไม่เกี่ยวข้องกับการบริหารรถ การซ่อมบำรุง เอกสาร และการวางแผนบำรุงรักษา
