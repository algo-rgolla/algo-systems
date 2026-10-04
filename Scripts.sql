-- Get all stocks which are 100M and Price change > 1

select * from [dbo].[EodhdSymbolDetails]
where [type] = 'Common Stock' 
and  [Change_P]> 2
and  marketCapitalization > 200000000 --50 Million
and  [Close] > 0.25
and Ema_50d > Ema_200d
and [Close] > Ema_50d
order by [Change_P] desc

-- Volume Spikers
select * from [dbo].[EodhdSymbolDetails]
where [type] = 'Common Stock' 
and  [Change_P] > 1
and [Volume] > [Avgvol_50d]
and [Volume] > [Avgvol_14d]
and marketCapitalization> 100000000 --50 Million
and [Close] > 0.25
and Ema_50d > Ema_200d
and [Close] > Ema_50d
order by [Change_P] desc


INSERT INTO [App].[ProductScanResult]
           ([ScanDate]
           ,[ScanType]
           ,[Symbol]
           ,[Description])
select GETDATE()
           ,'Scan_LongBigGainers'
           ,Code
           ,'BigGainers' from [dbo].[EodhdSymbolDetails]
where [type] = 'Common Stock' 
and  [Change_P]> 2
and  marketCapitalization > 200000000 --50 Million
and  [Close] > 0.25
and EMA21 > EMA63
and [Close] > EMA21
order by [Change_P] desc


select * from [dbo].[EodhdSymbols]
where Code in(
select symbol from [App].[ProductScanResult])

-- Brings Codes EMA21 to 63 is less than 2% 
SELECT Code, EMA21, EMA63, Avgvol_50d
FROM [dbo].[EodhdSymbolDetails]
WHERE (
(((EMA21 - EMA63) / EMA63) * 100 BETWEEN 0 AND 2) or 
(((EMA21 - EMA63) / EMA63) * 100 BETWEEN -2 AND 0)
)
and exchange_Short_Name = 'AU'
and [Close] > EMA21
and MarketCapitalization > 200000000 -- 100m
and Change_P > 1
and [Close] > Prev_Close
and (Volume > Avgvol_50d)
and len(Code) = 3
and Volume > 300000