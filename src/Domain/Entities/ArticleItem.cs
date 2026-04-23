namespace clean.Domain.Entities;

public class ArticleItem : BaseAuditableEntity
{
    public ArticleItem()
    {
        AddDomainEvent(new ArticleItemCreatedEvent(this));
    }

    public string? Title { get; set; }

    public string? Content { get; set; }

    private ArticleStatus _status;
    public ArticleStatus Status
    {
        get => _status;
        set
        {
            if (value == ArticleStatus.Published && _status != ArticleStatus.Published)
            {
                if (string.IsNullOrWhiteSpace(Title) || string.IsNullOrWhiteSpace(Content))
                    throw new InvalidOperationException("Title and Content must not be empty to publish an article.");

                AddDomainEvent(new ArticleItemPublishedEvent(this));
            }

            _status = value;
        }
    }
}
