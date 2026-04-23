using clean.Domain.Events;
using Microsoft.Extensions.Logging;

namespace clean.Application.Articles.EventHandlers;

public class LogArticleItemCreated : INotificationHandler<ArticleItemCreatedEvent>
{
    private readonly ILogger<LogArticleItemCreated> _logger;

    public LogArticleItemCreated(ILogger<LogArticleItemCreated> logger)
    {
        _logger = logger;
    }

    public Task Handle(ArticleItemCreatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("clean Domain Event: {DomainEvent}", notification.GetType().Name);

        return Task.CompletedTask;
    }
}
