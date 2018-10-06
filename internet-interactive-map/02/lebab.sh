FILE=$1

# safe
lebab --replace $FILE --transform arrow
lebab --replace $FILE --transform for-of
lebab --replace $FILE --transform for-each
lebab --replace $FILE --transform arg-rest
lebab --replace $FILE --transform arg-spread
lebab --replace $FILE --transform obj-method
lebab --replace $FILE --transform obj-shorthand
lebab --replace $FILE --transform multi-var
# unsafe
lebab --replace $FILE --transform let
lebab --replace $FILE --transform template